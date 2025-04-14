
import { corsHeaders } from './config.ts';
import { handleJobSearch } from './job-search-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Route the request to the appropriate handler
  if (req.method === 'POST') {
    return await handleJobSearch(req);
  }

  // Return method not allowed for other HTTP methods
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
  );
});
