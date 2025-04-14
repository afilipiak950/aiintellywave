
// CORS headers configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Apify configuration
export const apifyToken = Deno.env.get('APIFY_API_KEY') || '';
export const apifyActorUrl = 'https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items';
