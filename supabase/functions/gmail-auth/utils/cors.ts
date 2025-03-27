
/**
 * CORS utilities for Gmail Auth edge function
 */

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handles CORS preflight requests
 * @returns Response for OPTIONS requests
 */
export function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

