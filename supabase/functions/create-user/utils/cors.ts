
// Define CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS preflight requests with CORS headers
export function handleCorsPreflightRequest() {
  console.log('Handling CORS preflight request');
  return new Response('Preflight OK', { 
    status: 204, 
    headers: corsHeaders 
  });
}

// Create standard response with proper CORS headers
export function createResponse(body: any, status: number = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
}
