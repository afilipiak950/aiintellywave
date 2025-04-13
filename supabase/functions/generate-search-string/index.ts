
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
      type, 
      input_text, 
      input_url, 
      input_source, 
      company_id,
      user_id,
      search_string_id 
    } = body;
    
    console.log(`Processing ${type} search string from ${input_source}`);
    
    let prompt = "";
    let contextData = "";
    
    // Prepare context data based on input source
    if (input_source === "text") {
      contextData = input_text;
    } else if (input_source === "website" && input_url) {
      try {
        // Fetch website content
        const response = await fetch(input_url);
        if (response.ok) {
          const html = await response.text();
          // Very basic HTML to text conversion - in a real app use a better parser
          contextData = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
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
      // We'll extract the PDF data in a separate step before calling this function
      // Here we would just use the extracted text passed in input_text
      contextData = input_text;
    }
    
    // Build appropriate prompt based on type
    if (type === "recruiting") {
      prompt = `
You are an expert recruiter who helps create optimized search strings for finding candidates.
Based on the following job description, create a detailed LinkedIn search string with Boolean operators (AND, OR, NOT).
Focus on key skills, experience level, job titles, and qualifications.

Job Description:
${contextData}

Format your response as a ready-to-use search string with appropriate Boolean syntax (quotes, parentheses, etc.).
`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert in sales and lead generation who helps create optimized search strings for finding potential clients.
Based on the following company and target audience description, create a detailed LinkedIn search string with Boolean operators (AND, OR, NOT).
Focus on industries, company sizes, job titles, and other relevant characteristics.

Target Description:
${contextData}

Format your response as a ready-to-use search string with appropriate Boolean syntax (quotes, parentheses, etc.).
`;
    }
    
    // Call OpenAI API to generate the search string
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
    const generatedSearchString = aiResult.choices[0].message.content.trim();
    
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
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
