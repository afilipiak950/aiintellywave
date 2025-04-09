
import { corsHeaders } from "../corsHeaders.ts";

export function handleApiKeyError() {
  console.error('Instantly API key not configured');
  return new Response(
    JSON.stringify({ 
      error: 'Instantly API key not configured',
      message: 'Please configure the INSTANTLY_API_KEY in Supabase secrets'
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function handleParseError(error: Error) {
  console.error('Error parsing request body:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Invalid request body', 
      message: 'Could not parse the request JSON data'
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function handleUnknownAction(action: string) {
  return new Response(
    JSON.stringify({ error: `Unknown action: ${action}` }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function handleServerError(error: Error) {
  console.error('Error processing request:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message || 'An unexpected error occurred',
      stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
