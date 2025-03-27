
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleAISearch } from "./handlers.ts";
import { corsHeaders } from "./utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    return await handleAISearch(req);
  } catch (error) {
    console.error('Error in ai-search function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An error occurred during your search.',
        details: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
