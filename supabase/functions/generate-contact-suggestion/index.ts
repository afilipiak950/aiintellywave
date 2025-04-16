
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PROJECT_ID } from "../google-jobs-scraper/config.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobs, query } = await req.json();
    
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No jobs provided" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log(`Generating AI contact suggestion for ${jobs.length} jobs with search query: ${query}`);
    
    // Prepare data for prompt
    const jobData = jobs.slice(0, 5).map(job => ({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description.substring(0, 200) + "..." // Truncate for brevity
    }));
    
    const prompt = `
    Ich suche einen Karrierewechsel und habe nach "${query}" gesucht. 
    Hier sind einige interessante Stellenangebote, die ich gefunden habe:
    
    ${JSON.stringify(jobData, null, 2)}
    
    Bitte hilf mir, eine professionelle und überzeugende Nachricht für HR-Mitarbeiter oder Recruiter zu erstellen, 
    in der ich mein Interesse an solchen Positionen zum Ausdruck bringe. 
    Die Nachricht sollte:
    
    1. Mein Interesse an dieser Art von Position deutlich machen
    2. Professionell und höflich sein
    3. Nach weiteren Informationen über offene Stellen fragen
    4. Um ein kurzes Gespräch oder einen Austausch bitten
    5. Etwa 150-200 Wörter lang sein
    
    Bitte formuliere die Nachricht auf Deutsch mit einer klaren Struktur und professionellem Ton.`;
    
    console.log("Sending prompt to OpenAI API");
    
    // Make API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Du bist ein Karriereberater, der hilft, professionelle Anfragen für Jobsuchende zu formulieren."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }
    
    const data = await response.json();
    const contactSuggestion = data.choices[0].message.content;
    
    console.log("Successfully generated contact suggestion");
    
    return new Response(
      JSON.stringify({ suggestion: contactSuggestion }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in generate-contact-suggestion:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
