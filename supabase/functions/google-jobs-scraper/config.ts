
// Configuration for the Google Jobs Scraper edge function

// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase configuration
export const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://ootziscicbahucatxyme.supabase.co";
export const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Apify configuration
export const apifyApiKey = Deno.env.get("APIFY_API_KEY") || "";
export const googleJobsActorId = "dtrungtin/google-jobs-scraper";
