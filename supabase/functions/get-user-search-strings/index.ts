
// Diese Edge-Funktion ruft Search Strings für einen Benutzer ab
// Sie umgeht RLS-Richtlinien, die möglicherweise Rekursionsfehler verursachen
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
    // User ID aus Request-Body holen
    const body = await req.json().catch(() => ({}));
    const userId = body.userId || '';
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId ist erforderlich' }),
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
      console.error('Fehlende Supabase-Konfiguration');
      return new Response(
        JSON.stringify({ error: 'Serverfehler: Fehlende Konfiguration' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Direkte Abfrage der search_strings-Tabelle mit Service-Rolle (umgeht RLS)
    const { data, error } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Search Strings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Erfolgreich ${data.length} Search Strings für User ${userId} abgerufen`);
    
    return new Response(
      JSON.stringify({ searchStrings: data }),
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
