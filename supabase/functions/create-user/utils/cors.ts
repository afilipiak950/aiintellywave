
import { corsHeaders } from "./constants.ts";

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Create a standardized response with proper CORS headers
 */
export function createResponse(body: any, status = 200): Response {
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

// Define exported CORS headers
export { corsHeaders };
