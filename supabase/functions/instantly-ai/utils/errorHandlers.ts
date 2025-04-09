
import { corsHeaders } from "../corsHeaders.ts";

/**
 * Standard error response for missing API key
 */
export function handleApiKeyError() {
  console.error('Instantly API key not configured');
  return new Response(
    JSON.stringify({ 
      error: 'API key missing',
      message: 'Please configure the INSTANTLY_API_KEY in Supabase secrets'
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Standard error response for JSON parse errors
 */
export function handleParseError(error: Error, rawBody?: string) {
  console.error('Error parsing request body:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Invalid request body', 
      message: 'Could not parse the request JSON data',
      details: error.message,
      rawBody: rawBody ? (rawBody.length > 100 ? `${rawBody.substring(0, 100)}...` : rawBody) : undefined
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Standard error response for empty request bodies
 */
export function handleEmptyBodyError() {
  console.error('Empty request body received');
  return new Response(
    JSON.stringify({ 
      error: 'Empty request body',
      message: 'Request body cannot be empty. Please provide a valid JSON object with an "action" property.'
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Standard error response for unknown actions
 */
export function handleUnknownAction(action: string) {
  console.error(`Unknown action requested: ${action}`);
  return new Response(
    JSON.stringify({ 
      error: 'Invalid action', 
      message: `Unknown action: ${action}. Available actions: fetchCampaigns, fetchCampaignDetails, assignCampaign, refreshMetrics`
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Standard error response for server errors
 */
export function handleServerError(error: Error) {
  console.error('Error processing request:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Server error', 
      message: error.message || 'An unexpected error occurred',
      stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
