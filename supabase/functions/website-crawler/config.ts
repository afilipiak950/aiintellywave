
// CORS headers for browser requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI API key from environment variables
export const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

// Import Supabase JS client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export function supabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options = {}
) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    ...options
  });
}

// Create Supabase client for background job
export function supabaseFunctionClient() {
  return supabaseClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
  );
}
