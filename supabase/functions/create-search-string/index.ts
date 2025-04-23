
// Diese Edge-Funktion erstellt einen neuen Search String
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// CORS-Header definieren
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    
    if (!body.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id ist erforderlich' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase-Client mit Service-Rolle initialisieren, um RLS zu umgehen
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Serverfehler: Fehlende Konfiguration' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Payload für den Search String vorbereiten
    const searchStringData = {
      user_id: body.user_id,
      company_id: body.company_id,
      type: body.type,
      input_source: body.input_source,
      input_text: body.input_text || null,
      input_url: body.input_url || null,
      input_pdf_path: body.input_pdf_path || null,
      status: 'new',
      is_processed: false,
      progress: 0
    };
    
    // Search String in die Datenbank einfügen
    const { data: searchString, error } = await supabase
      .from('search_strings')
      .insert(searchStringData)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Erstellen des Search Strings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Simuliere ein Ergebnis nach kurzer Zeit (in einer echten Implementierung würde hier eine komplexere Verarbeitung stattfinden)
    setTimeout(async () => {
      try {
        // Generiere einen einfachen Search String basierend auf dem Eingabetyp
        let generatedString = '';
        
        if (searchString.input_source === 'text' && searchString.input_text) {
          generatedString = `(${searchString.input_text.replace(/[^\w\s]/g, ' ').split(' ').filter(word => word.length > 3).join(' OR ')})`;
        } else if (searchString.input_source === 'website' && searchString.input_url) {
          generatedString = `(site:${new URL(searchString.input_url).hostname}) AND (${searchString.type === 'recruiting' ? 'jobs OR career OR hiring' : 'services OR products OR solutions'})`;
        } else if (searchString.input_source === 'pdf') {
          generatedString = `(filetype:pdf) AND (${searchString.type === 'recruiting' ? 'resume OR cv OR "job application"' : 'business OR company OR enterprise'})`;
        }
        
        // Update des Search Strings mit dem generierten String
        await supabase
          .from('search_strings')
          .update({
            generated_string: generatedString,
            status: 'completed',
            is_processed: true,
            processed_at: new Date().toISOString()
          })
          .eq('id', searchString.id);
          
      } catch (processError) {
        console.error('Fehler bei der Verarbeitung:', processError);
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            error: processError.message
          })
          .eq('id', searchString.id);
      }
    }, 2000);
    
    return new Response(
      JSON.stringify({ success: true, searchString }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
    return new Response(
      JSON.stringify({ error: 'Ein unerwarteter Fehler ist aufgetreten' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
