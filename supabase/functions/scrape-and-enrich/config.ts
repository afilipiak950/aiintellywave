
// CORS Headers für alle Requests
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Lade die OpenAI API Key aus der Umgebung
export const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
export const apolloApiKey = Deno.env.get("APOLLO_API_KEY") || "";

// Helper für Supabase-Client mit Service-Role für Edge-Funktionen
export async function supabaseFunctionClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  console.log("Initialisiere Supabase-Client mit folgenden Werten:", {
    urlConfigured: !!supabaseUrl,
    keyConfigured: !!supabaseServiceKey,
  });
  
  try {
    // Verwende Deno's dynamischen Import für den Supabase-Client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    return client;
  } catch (error) {
    console.error("Fehler bei der Initialisierung des Supabase-Clients:", error);
    throw new Error(`Supabase-Client Initialisierungsfehler: ${error.message}`);
  }
}
