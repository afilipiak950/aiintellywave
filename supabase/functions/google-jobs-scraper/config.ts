
// CORS headers for browser compatibility
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API key for Apify
export const apifyApiKey = Deno.env.get('APIFY_API_KEY') || '';

// Supabase credentials for database operations
export const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
export const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
