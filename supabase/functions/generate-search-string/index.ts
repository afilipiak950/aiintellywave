
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
You are an expert recruiter who helps create optimized search strings for finding candidates.
Based on the following job description, create a detailed LinkedIn search string with Boolean operators (AND, OR, NOT).
Focus on exactly the key skills, experience level, job titles, and qualifications mentioned in the input.
Do not add any information that is not in the input text.

Job Description:
${contextData}

Format your response as a ready-to-use search string with appropriate Boolean syntax (quotes, parentheses, etc.).
The search string should be formatted for LinkedIn search and should contain ALL the key terms from the input.
Do not explain your approach or add any commentary, just return the search string itself.
`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert in sales and lead generation who helps create optimized search strings for finding potential clients.
Based on the following company and target audience description, create a detailed LinkedIn search string with Boolean operators (AND, OR, NOT).
Focus on exactly the industries, company sizes, job titles, and other relevant characteristics mentioned in the input.
Do not add any information that is not in the input text.

Target Description:
${contextData}

Format your response as a ready-to-use search string with appropriate Boolean syntax (quotes, parentheses, etc.).
The search string should be formatted for LinkedIn search and should contain ALL the key terms from the input.
Do not explain your approach or add any commentary, just return the search string itself.
`;
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
                content: "You create optimized Boolean search strings for recruiting or lead generation."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
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
  
  // Extract potential job titles or skills (words with capital letters or specific patterns)
  const jobTitles = uniqueWords.filter(word => 
    /^[A-Z][a-z]+/.test(word) || 
    /^[a-zA-Z]+\s[a-zA-Z]+$/.test(word) ||
    /^[a-zA-Z]+\+$/.test(word) || // Match things like "C++" or "Java+"
    /^[0-9]+\+\s[a-zA-Z]+$/.test(word) // Match things like "5+ years"
  );
  
  // Get the top most frequent terms
  const keyTerms = uniqueWords.slice(0, Math.min(6, uniqueWords.length));
  
  // Create a more context-aware Boolean search string
  if (type === "recruiting") {
    // Add quotes around multi-word terms
    const quotedTerms = keyTerms.map(term => {
      return term.includes(" ") ? `"${term}"` : term;
    });
    
    // Include job titles if found
    const titleTerms = jobTitles.length > 0 
      ? `(${jobTitles.slice(0, 3).map(t => `"${t}"`).join(" OR ")})` 
      : "";
    
    return `(${quotedTerms.join(' OR ')}) AND ${titleTerms} ${titleTerms ? "AND " : ""}("resume" OR "CV" OR "profile")`;
  } else {
    // For lead generation, focus on company and industry terms
    const quotedTerms = keyTerms.map(term => {
      return term.includes(" ") ? `"${term}"` : term;
    });
    
    // Look for company size indicators
    const sizeTerms = uniqueWords.filter(word => 
      /[0-9]+\s*-\s*[0-9]+/.test(word) || // number ranges like 100-500
      /[0-9]+\+/.test(word) // numbers with + like 500+
    );
    
    const sizeClause = sizeTerms.length > 0 
      ? `AND (${sizeTerms.map(t => `"${t}"`).join(" OR ")})` 
      : "";
    
    return `(${quotedTerms.join(' OR ')}) AND ("company" OR "business") ${sizeClause}`;
  }
}
