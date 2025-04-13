
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const { 
      search_string_id,
      type, 
      input_text, 
      input_url, 
      input_source, 
      company_id,
      user_id
    } = body;
    
    if (!search_string_id) {
      throw new Error("Search string ID is required");
    }
    
    console.log(`Processing search string: ${search_string_id} of type ${type} from ${input_source}`);
    
    // Update status to processing if not already
    const { error: updateError } = await supabase
      .from('search_strings')
      .update({ status: 'processing' })
      .eq('id', search_string_id);
      
    if (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    let contextData = "";
    
    // Prepare context data based on input source
    if (input_source === "text") {
      contextData = input_text || "";
      console.log("Text input data:", contextData);
    } else if (input_source === "website" && input_url) {
      try {
        // Fetch website content using crawler function
        console.log("Fetching website:", input_url);
        const response = await fetch(input_url);
        if (response.ok) {
          const html = await response.text();
          // Extract text with our enhanced job-focused extraction
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Remove script, style, nav, footer elements
          ['script', 'style', 'nav', 'footer', 'header'].forEach(tag => {
            const elements = doc.getElementsByTagName(tag);
            for (let i = elements.length - 1; i >= 0; i--) {
              elements[i].parentNode.removeChild(elements[i]);
            }
          });
          
          // Prioritize job-related content
          let jobContent = "";
          
          // Look for job description containers
          const jobContainers = [
            '.job-description', '#job-description', '.job-details', '.job-content',
            '[class*="job-description"]', '[id*="job-description"]',
            '[class*="jobDescription"]', '[id*="jobDescription"]'
          ];
          
          for (const selector of jobContainers) {
            try {
              const elements = doc.querySelectorAll(selector);
              for (const el of elements) {
                jobContent += el.textContent + "\n\n";
              }
            } catch (e) {
              console.log(`Error with selector ${selector}:`, e);
            }
          }
          
          // Get all the text content as a fallback
          const bodyText = doc.body.textContent || "";
          contextData = jobContent || bodyText;
          
          // Clean up text
          contextData = contextData
            .replace(/\s+/g, ' ')
            .trim();
            
          console.log("Website content extracted, length:", contextData.length);
        } else {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching website:", error);
        return new Response(
          JSON.stringify({ error: `Failed to process website: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } else if (input_source === "pdf") {
      // Get the search string record to retrieve the PDF text
      const { data: stringData, error: stringError } = await supabase
        .from('search_strings')
        .select('input_text')
        .eq('id', search_string_id)
        .single();
        
      if (stringError) {
        console.error("Error retrieving search string:", stringError);
        throw new Error(`Failed to retrieve PDF text: ${stringError.message}`);
      }
      
      contextData = stringData?.input_text || "";
      console.log("PDF content extracted, length:", contextData.length);
    }
    
    // Build improved prompts based on type
    let prompt = "";
    if (type === "recruiting") {
      prompt = `
You are an experienced Boolean search string creator specializing in recruitment searches. Your task is to analyze the following job description and create a comprehensive LinkedIn search string with precise Boolean logic.

IMPORTANT RULES:
1. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
2. Group related terms with parentheses for proper logic
3. Place related skills/requirements in OR groups, connected with AND operators between different categories
4. Use double quotes around exact phrases, especially for job titles 
5. Analyze the language of the content (English, German, etc.) and adapt the search terms accordingly
6. Never invent terms - only use information present in the job description
7. Include alternative phrasings/synonyms for important skills and requirements within OR groups
8. Identify and include key skills, qualifications, education levels, and experience requirements
9. Analyze the context to determine primary vs. secondary skills and weight accordingly
10. For technical roles, identify programming languages, frameworks, tools, and technologies

JOB DESCRIPTION:
${contextData}

ADDITIONAL INSTRUCTIONS:
- Format your response as a READY-TO-USE BOOLEAN SEARCH STRING without any explanations
- Make the search specific enough to find qualified candidates but not too narrow to exclude potential matches
- Prioritize the most important requirements using AND operators
- If the job description mentions specific years of experience, include those in your search
- If company information is provided, include relevant industry terms
- ALWAYS USE "AND" BETWEEN DIFFERENT CONCEPT GROUPS, NOT "OR"`;
    } else if (type === "lead_generation") {
      prompt = `
You are an experienced Boolean search string creator specializing in lead generation. Your task is to analyze the following target audience description and create a comprehensive LinkedIn search string with precise Boolean logic.

IMPORTANT RULES:
1. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
2. Group related terms with parentheses for proper logic
3. Place related industries/roles in OR groups, connected with AND operators between different categories
4. Use double quotes around exact phrases, especially for titles and industries
5. Analyze the language of the content (English, German, etc.) and adapt the search terms accordingly
6. Never invent terms - only use information present in the description
7. Include alternative phrasings/synonyms for important criteria within OR groups
8. Identify and include key industries, company sizes, job titles, and locations
9. Analyze the context to determine primary vs. secondary targeting criteria
10. Focus on decision-makers and people with purchasing authority

TARGET AUDIENCE DESCRIPTION:
${contextData}

ADDITIONAL INSTRUCTIONS:
- Format your response as a READY-TO-USE BOOLEAN SEARCH STRING without any explanations
- Make the search specific enough to find qualified leads but not too narrow to exclude potential prospects
- Prioritize the most important criteria using AND operators
- If company size or revenue information is provided, include those in your search
- If specific industries are mentioned, include those and similar industries
- ALWAYS USE "AND" BETWEEN DIFFERENT CONCEPT GROUPS, NOT "OR"`;
    }
    
    // Call OpenAI API to generate the search string
    let generatedSearchString = "";
    
    if (openAIKey) {
      try {
        console.log("Calling OpenAI API with prompt length:", prompt.length);
        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert at creating precise Boolean search strings that follow strict logical structure and syntax."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.2, // Lower temperature for more consistent results
            max_tokens: 1500,
          }),
        });
        
        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const aiResult = await openAIResponse.json();
        generatedSearchString = aiResult.choices[0].message.content.trim();
        console.log("Generated search string:", generatedSearchString);
      } catch (openAIError) {
        console.error("Error calling OpenAI:", openAIError);
        
        // Fallback to a simple generated string
        generatedSearchString = generateFallbackSearchString(contextData, type);
      }
    } else {
      console.warn("OpenAI API key not configured, using fallback generation");
      generatedSearchString = generateFallbackSearchString(contextData, type);
    }
    
    // Update the search string in the database
    const { data, error } = await supabase
      .from('search_strings')
      .update({
        generated_string: generatedSearchString,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id)
      .select();
    
    if (error) {
      console.error("Error updating search string:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        search_string: generatedSearchString,
        record: data?.[0] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Update the search string status to failed
    try {
      const body = await req.json();
      const searchStringId = body.search_string_id;
      
      if (searchStringId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', searchStringId);
      }
    } catch (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Improved fallback search string generation in case OpenAI is unavailable
function generateFallbackSearchString(text: string, type: string): string {
  // Extract keywords from text - better tokenization
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 2);
  
  // Remove common stop words and duplicates
  const stopwords = ["and", "the", "with", "from", "this", "that", "have", "not", "for", "will", "are", "was", "ist", "und", "der", "die", "das"];
  const uniqueWords = Array.from(new Set(words))
    .filter(word => !stopwords.includes(word.toLowerCase()) && word.length > 2);
  
  // Detect language - basic German word detection
  const germanWords = ["der", "die", "das", "und", "ist", "für", "von", "mit", "bei", "oder", "über", "nach", "Erfahrung", "Jahre", "Kenntnisse"];
  const isGerman = words.some(word => germanWords.includes(word.toLowerCase()));
  
  // Get specific domain terms for different categories
  const extractTermsByCategory = (terms: string[], categories: string[]) => {
    return terms.filter(term => 
      categories.some(category => 
        term.toLowerCase().includes(category.toLowerCase())
      )
    );
  };
  
  // Extract potential job titles or skills (words with capital letters or specific patterns)
  const jobTitles = uniqueWords.filter(word => 
    /^[A-Z][a-z]+/.test(word) || 
    /^[a-zA-Z]+\s[a-zA-Z]+$/.test(word) ||
    /^[a-zA-Z]+\+$/.test(word) || // Match things like "C++" or "Java+"
    /^[0-9]+\+\s[a-zA-Z]+$/.test(word) // Match things like "5+ years"
  );
  
  // Extract locations
  const locations = extractTermsByCategory(uniqueWords, ["Berlin", "Hamburg", "München", "Frankfurt", "Köln", "city", "remote", "Stadt", "Region"]);
  
  // Extract experience terms
  const experienceTerms = extractTermsByCategory(uniqueWords, ["year", "Jahre", "experience", "Erfahrung", "senior", "junior", "Berufserfahrung"]);
  
  // Extract skills for tech roles
  const techSkills = extractTermsByCategory(uniqueWords, ["Java", "Python", "JavaScript", "React", "Node", "AWS", "Azure", "SQL", "Excel", "SAP", "DATEV"]);
  
  // Get the top most frequent terms for general categories
  const keyTerms = uniqueWords.slice(0, Math.min(6, uniqueWords.length));
  
  // Create a more context-aware Boolean search string
  if (type === "recruiting") {
    // Format groups with proper Boolean operators
    const titleGroup = jobTitles.length > 0 
      ? `(${jobTitles.slice(0, 3).map(t => `"${t}"`).join(" OR ")})` 
      : "";
    
    const locationGroup = locations.length > 0
      ? `(${locations.slice(0, 3).map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    const skillGroup = techSkills.length > 0
      ? `(${techSkills.map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    const experienceGroup = experienceTerms.length > 0
      ? `(${experienceTerms.map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    // Construct search string with proper AND operators between groups
    let searchString = "";
    
    if (titleGroup) searchString += titleGroup;
    if (locationGroup) searchString += searchString ? ` AND ${locationGroup}` : locationGroup;
    if (skillGroup) searchString += searchString ? ` AND ${skillGroup}` : skillGroup;
    if (experienceGroup) searchString += searchString ? ` AND ${experienceGroup}` : experienceGroup;
    
    // Add resume/CV terms
    const resumeTerms = isGerman 
      ? `("Lebenslauf" OR "CV" OR "Resume")` 
      : `("Resume" OR "CV")`;
    
    searchString += searchString ? ` AND ${resumeTerms}` : resumeTerms;
    
    return searchString || `(${keyTerms.join(" OR ")}) AND ("resume" OR "CV")`;
    
  } else {
    // For lead generation
    const industryTerms = extractTermsByCategory(uniqueWords, ["industry", "sector", "business", "Branche", "Industrie", "Unternehmen"]);
    const companyTypeTerms = extractTermsByCategory(uniqueWords, ["GmbH", "AG", "Inc", "Corp", "LLC", "KG", "OHG"]);
    const positionTerms = extractTermsByCategory(uniqueWords, ["CEO", "CFO", "CTO", "Manager", "Director", "Head", "Lead", "Leiter", "Geschäftsführer"]);
    
    // Format groups with proper Boolean operators
    const industryGroup = industryTerms.length > 0 
      ? `(${industryTerms.slice(0, 3).map(t => `"${t}"`).join(" OR ")})` 
      : "";
    
    const locationGroup = locations.length > 0
      ? `(${locations.slice(0, 3).map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    const positionGroup = positionTerms.length > 0
      ? `(${positionTerms.map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    const companyGroup = companyTypeTerms.length > 0
      ? `(${companyTypeTerms.map(t => `"${t}"`).join(" OR ")})`
      : "";
    
    // Construct search string with proper AND operators between groups
    let searchString = "";
    
    if (positionGroup) searchString += positionGroup;
    if (industryGroup) searchString += searchString ? ` AND ${industryGroup}` : industryGroup;
    if (locationGroup) searchString += searchString ? ` AND ${locationGroup}` : locationGroup;
    if (companyGroup) searchString += searchString ? ` AND ${companyGroup}` : companyGroup;
    
    return searchString || `(${keyTerms.join(" OR ")}) AND ("company" OR "business")`;
  }
}
