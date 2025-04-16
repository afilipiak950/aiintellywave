
import { corsHeaders } from '../google-jobs-scraper/config.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get Supabase connection details from environment
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// OpenAI API key for generating contact suggestions
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobs, query, userId, companyId } = await req.json();

    // Validate required parameters
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Keine Jobangebote zur Analyse bereitgestellt'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OpenAI API-Schlüssel ist nicht konfiguriert'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Generate a contact suggestion using the job data
    const suggestion = await generateContactSuggestion(jobs, query);
    
    // If we have a valid user and company ID, store the suggestion
    if (userId && companyId && suggestion) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        
        // Store the AI suggestion
        await supabase.from('job_search_history')
          .update({ ai_contact_suggestion: suggestion })
          .eq('user_id', userId)
          .eq('company_id', companyId)
          .eq('search_query', query);
          
        console.log('Saved contact suggestion for user', userId);
      } catch (error) {
        console.error('Error storing contact suggestion:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestion 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error generating contact suggestion:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function generateContactSuggestion(jobs: any[], searchQuery: string): Promise<string> {
  try {
    // Prepare job data for the prompt
    const jobsData = jobs.slice(0, 3).map((job: any, index: number) => 
      `Job ${index + 1}:
      - Title: ${job.title}
      - Company: ${job.company}
      - Location: ${job.location || 'Not specified'}
      - Description: ${truncateText(job.description || 'No description available.', 200)}`
    ).join('\n\n');

    // Since Clay API isn't actually implemented, we'll simulate with OpenAI
    const messages = [
      {
        role: "system",
        content: `Du bist ein KI-Assistent, der personalisierte Kontaktvorschläge für die Bewerbung auf Stellenangebote erstellt. Basierend auf den Jobangeboten und den Suchbegriffen sollst du einen personalisierte Kontakt-Strategie vorschlagen, mit Anleitung, wie die HR-Person am besten zu kontaktieren ist.`
      },
      {
        role: "user",
        content: `Ich suche nach Jobs mit dem Suchbegriff: "${searchQuery}". Hier sind einige relevante Jobangebote:
        
        ${jobsData}
        
        Bitte erstelle einen personalisierten Kontaktvorschlag für diese Jobmöglichkeiten mit folgenden Elementen:
        1. Wie ich am besten die HR-Person oder den Recruiter kontaktieren könnte
        2. Welche Plattformen ich nutzen sollte (LinkedIn, Xing, direkte E-Mail)
        3. Einen kurzen Beispieltext für die erste Kontaktaufnahme
        4. 2-3 Tipps, wie ich in meiner Bewerbung besonders auf die Anforderungen dieser Stelle eingehen kann
        
        Bitte formuliere die Antwort auf Deutsch.`
      }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from OpenAI');
    }
  } catch (error) {
    console.error('Error generating contact suggestion with OpenAI:', error);
    return "Es konnte leider kein Kontaktvorschlag generiert werden. Bitte versuchen Sie es später erneut.";
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
