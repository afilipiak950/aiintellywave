
// Diese Edge-Funktion löscht einen Search String
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
    
    if (!body.id || !body.userId) {
      return new Response(
        JSON.stringify({ error: 'id und userId sind erforderlich' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Supabase-Client mit Service-Rolle initialisieren
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
    
    // Prüfen, ob der Benutzer Eigentümer des Search Strings ist
    const { data: searchString, error: fetchError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('id', body.id)
      .eq('user_id', body.userId)
      .single();
      
    if (fetchError || !searchString) {
      return new Response(
        JSON.stringify({ error: 'Search String nicht gefunden oder keine Berechtigung' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Search String löschen
    const { error: deleteError } = await supabase
      .from('search_strings')
      .delete()
      .eq('id', body.id);
    
    if (deleteError) {
      console.error('Fehler beim Löschen des Search Strings:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true }),
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
