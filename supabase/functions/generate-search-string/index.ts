
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
        // Fetch website content
        console.log("Fetching website:", input_url);
        const response = await fetch(input_url);
        if (response.ok) {
          const html = await response.text();
          // Very basic HTML to text conversion - in a real app use a better parser
          contextData = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
    
    // Build appropriate prompt based on type
    let prompt = "";
    if (type === "recruiting") {
      prompt = `
You are an expert recruiter who helps create optimized search strings for finding candidates on LinkedIn.
Based on the following job description, create a detailed LinkedIn search string with Boolean operators.

IMPORTANT GUIDELINES:
1. Use proper Boolean logic with AND, OR, NOT operators consistently
2. Group related terms with parentheses for proper logic evaluation
3. Place key skills and requirements in OR groups, connected with AND operators for different categories
4. Use double quotes around exact phrases and titles
5. Format for LinkedIn search syntax compatibility
6. Never invent terms not present in the job description
7. Always analyze the text carefully to identify key requirements, skills, and qualifications
8. Create multi-faceted searches with education, experience, skills, location, and job titles when specified
9. For German content, ensure proper handling of German terms and locations
10. For technical roles, include relevant tools, technologies, and programming languages

Job Description:
${contextData}

FORMAT YOUR RESPONSE AS A READY-TO-USE SEARCH STRING WITHOUT ANY EXPLANATIONS.
EXAMPLE: ("Software Engineer" OR "Developer") AND (Java OR Python) AND ("Bachelor Degree" OR "Master Degree") AND (experience)`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert in sales and lead generation who helps create optimized search strings for finding potential clients.
Based on the following target audience description, create a detailed LinkedIn search string with Boolean operators.

IMPORTANT GUIDELINES:
1. Use proper Boolean logic with AND, OR, NOT operators consistently
2. Group related terms with parentheses for proper logic evaluation
3. Place related industries/roles in OR groups, connected with AND operators for different categories
4. Use double quotes around exact phrases and titles
5. Format for LinkedIn search syntax compatibility
6. Never invent terms not present in the input text
7. Always analyze the text carefully to identify target industries, company sizes, job titles, and locations
8. Create multi-faceted searches that combine industry, role, seniority, and company attributes
9. For German content, ensure proper handling of German terms and locations

Target Description:
${contextData}

FORMAT YOUR RESPONSE AS A READY-TO-USE SEARCH STRING WITHOUT ANY EXPLANATIONS.
EXAMPLE: (CEO OR "Chief Executive Officer") AND ("Manufacturing" OR "Production") AND ("50-200 employees" OR "201-500 employees")`;
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
                content: "You create optimized Boolean search strings for recruiting or lead generation that follow strict Boolean logic rules."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.5,
            max_tokens: 1000,
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
