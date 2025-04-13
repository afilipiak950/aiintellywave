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
        // Fetch website content using improved crawler functionality
        console.log("Fetching website content from:", input_url);
        
        // Make sure URL has protocol
        const urlWithProtocol = input_url.startsWith('http') ? input_url : `https://${input_url}`;
        
        // Fetch the webpage content
        const response = await fetch(urlWithProtocol, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SearchStringBot/1.0; +https://example.com/bot)'
          },
          // Set timeout to 15 seconds
          signal: AbortSignal.timeout(15000)
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        
        // Get content type to ensure we're dealing with HTML
        const contentType = response.headers.get('Content-Type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
          throw new Error(`Invalid content type: ${contentType}. Expected HTML.`);
        }
        
        // Get the HTML content
        const html = await response.text();
        console.log(`Received HTML content, length: ${html.length} characters`);
        
        // Extract text with enhanced job-focused extraction
        // Create a simplified DOM parser for Deno
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Prioritize job-related content with specific selectors
        let jobContent = "";
        
        // Common job description container selectors
        const jobSelectors = [
          '.job-description', '#job-description', '.job-details', '.job-content',
          '[class*="job-description"]', '[id*="job-description"]',
          '[class*="jobDescription"]', '[id*="jobDescription"]',
          '[class*="job"]', '[id*="job"]', '.position-details', '#position-details',
          '.vacancy', '#vacancy', '.stelle', '#stelle',
          '.career-opportunity', '#career-opportunity'
        ];
        
        // Try to extract content from job-specific containers
        let foundJobSpecificContent = false;
        
        for (const selector of jobSelectors) {
          try {
            const elements = doc.querySelectorAll(selector);
            for (const el of elements) {
              const text = el.textContent || '';
              if (text.trim().length > 100) { // Only include substantial sections
                jobContent += text + "\n\n";
                foundJobSpecificContent = true;
              }
            }
          } catch (e) {
            console.log(`Error with selector ${selector}:`, e);
          }
        }
        
        // If no job-specific content found, extract from common elements
        if (!foundJobSpecificContent) {
          console.log("No job-specific containers found, extracting from common elements");
          
          // Extract headings which often contain job titles
          const headings = doc.querySelectorAll('h1, h2, h3');
          for (const heading of headings) {
            jobContent += heading.textContent + "\n";
          }
          
          // Extract paragraphs
          const paragraphs = doc.querySelectorAll('p');
          for (const p of paragraphs) {
            jobContent += p.textContent + "\n";
          }
          
          // Extract lists which often contain requirements
          const listItems = doc.querySelectorAll('li');
          for (const li of listItems) {
            jobContent += "• " + li.textContent + "\n";
          }
        }
        
        // Fallback to body content if nothing else worked
        if (jobContent.trim().length < 200) {
          console.log("Extracted job content too short, falling back to body content");
          jobContent = doc.body.textContent || "";
        }
        
        // Clean up text
        contextData = jobContent
          .replace(/\s+/g, ' ')
          .trim();
          
        console.log("Website content extracted, length:", contextData.length);
        console.log("First 200 chars of extracted content:", contextData.substring(0, 200));
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
You are an expert Boolean search string creator specializing in recruitment searches. Your task is to analyze the following job description and create a comprehensive LinkedIn search string that uses Boolean logic.

USER INPUT TEXT:
${contextData}

IMPORTANT RULES:
1. You MUST include EVERY significant word, term, and phrase from the user input
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for job titles
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. NEVER omit any part of the user's input - include ALL provided information
7. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
8. For technical roles, identify ALL programming languages, frameworks, and technologies
9. If years of experience or location are mentioned, ALWAYS include them
10. Use proper German (if detecting German language) synonyms and translations where appropriate

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important requirements with AND operators
- Include experience details and company information exactly as specified
- MAKE SURE TO USE EVERY WORD FROM THE INPUT in proper Boolean format`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert Boolean search string creator specializing in lead generation. Your task is to analyze the following target audience description and create a comprehensive LinkedIn search string that uses Boolean logic.

USER INPUT TEXT:
${contextData}

IMPORTANT RULES:
1. You MUST include EVERY significant word, term, and phrase from the user input
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for titles and industries
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. NEVER omit any part of the user's input - include ALL provided information
7. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
8. Identify and include ALL industries, company sizes, job titles, and locations mentioned
9. Use proper German (if detecting German language) synonyms and translations where appropriate
10. Focus on decision-makers and people with purchasing authority as mentioned in the input

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important criteria with AND operators
- Include company size, revenue information, and specific industries exactly as specified by the user
- MAKE SURE TO USE EVERY WORD FROM THE USER'S INPUT in proper Boolean format`;
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
                content: "You are an expert at creating precise Boolean search strings that follow strict logical structure and syntax. Your primary goal is to include ALL user input terms in the search string."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.1, // Lower temperature for more deterministic results
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
        generatedSearchString = generateFullInputSearchString(contextData, type);
      }
    } else {
      console.warn("OpenAI API key not configured, using fallback generation");
      generatedSearchString = generateFullInputSearchString(contextData, type);
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

// Completely reworked fallback search string generation to include ALL input text
function generateFullInputSearchString(text: string, type: string): string {
  // Extract all words from text - include everything
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 0);
  
  // Remove duplicates but keep ALL unique words
  const uniqueWords = Array.from(new Set(words));
  
  // Basic stopwords - keep these minimal to ensure we include most user input
  const basicStopwords = ["und", "the", "with", "from", "this", "that", "have"];
  const filteredWords = uniqueWords.filter(word => !basicStopwords.includes(word.toLowerCase()));
  
  // Detect language
  const isGerman = words.some(word => 
    ["der", "die", "das", "und", "ist", "für", "von"].includes(word.toLowerCase())
  );
  
  // Prepare search string components
  let searchTerms: string[] = [];
  
  // If it's a very short input, just use all terms
  if (filteredWords.length <= 10) {
    // For very short inputs, connect all terms with OR
    searchTerms = filteredWords.map(term => `"${term}"`);
    const searchString = `(${searchTerms.join(" OR ")})`;
    
    // Add type-specific ending
    if (type === "recruiting") {
      return `${searchString} AND (${isGerman ? '"Lebenslauf" OR "CV" OR "Resume"' : '"Resume" OR "CV"'})`;
    } else {
      return `${searchString} AND (${isGerman ? '"Unternehmen" OR "Firma" OR "Business"' : '"Company" OR "Business"'})`;
    }
  }
  
  // For longer inputs, organize terms into categories
  const jobTitles = filteredWords.filter(word => 
    /^[A-Z][a-z]+/.test(word) || 
    word.toLowerCase().includes("manager") ||
    word.toLowerCase().includes("entwickler") ||
    word.toLowerCase().includes("engineer") ||
    word.toLowerCase().includes("specialist")
  );
  
  const skills = filteredWords.filter(word =>
    word.toLowerCase().includes("java") ||
    word.toLowerCase().includes("python") ||
    word.toLowerCase().includes("c++") ||
    word.toLowerCase().includes("sap") ||
    word.toLowerCase().includes("excel") ||
    word.toLowerCase().includes("erfahrung") ||
    word.toLowerCase().includes("experience") ||
    word.toLowerCase().includes("kenntnisse")
  );
  
  const locations = filteredWords.filter(word =>
    word.toLowerCase().includes("berlin") ||
    word.toLowerCase().includes("hamburg") ||
    word.toLowerCase().includes("münchen") ||
    word.toLowerCase().includes("frankfurt") ||
    word.toLowerCase().includes("köln") ||
    word.toLowerCase().includes("remote") ||
    /\d+\s*km/.test(word.toLowerCase())
  );
  
  const experience = filteredWords.filter(word =>
    /\d+\s*[jy]/.test(word.toLowerCase()) ||
    word.toLowerCase().includes("jahr") ||
    word.toLowerCase().includes("year") ||
    word.toLowerCase().includes("senior") ||
    word.toLowerCase().includes("junior")
  );
  
  // Assign remaining words to general terms
  const generalTerms = filteredWords.filter(word => 
    !jobTitles.includes(word) && 
    !skills.includes(word) && 
    !locations.includes(word) &&
    !experience.includes(word)
  );
  
  // Build the search string with ALL input terms organized in categories
  const searchParts = [];
  
  if (jobTitles.length > 0) {
    searchParts.push(`(${jobTitles.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  if (skills.length > 0) {
    searchParts.push(`(${skills.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  if (locations.length > 0) {
    searchParts.push(`(${locations.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  if (experience.length > 0) {
    searchParts.push(`(${experience.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  if (generalTerms.length > 0) {
    searchParts.push(`(${generalTerms.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  // If no categories have words (unlikely), use all filtered words
  if (searchParts.length === 0) {
    searchParts.push(`(${filteredWords.map(t => `"${t}"`).join(" OR ")})`);
  }
  
  // Combine all parts with AND
  const searchString = searchParts.join(" AND ");
  
  // Add type-specific ending
  if (type === "recruiting") {
    return `${searchString} AND (${isGerman ? '"Lebenslauf" OR "CV" OR "Resume"' : '"Resume" OR "CV"'})`;
  } else {
    return `${searchString} AND (${isGerman ? '"Unternehmen" OR "Firma" OR "Business"' : '"Company" OR "Business"'})`;
  }
}
