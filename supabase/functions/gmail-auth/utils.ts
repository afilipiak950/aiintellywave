
/**
 * Utility functions for the Gmail Auth edge function
 */

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validates required environment variables
 * @returns Object with validation status and missing variables
 */
export function validateEnvVars() {
  const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
  const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
  const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
  
  const missingVars = [];
  
  if (!CLIENT_ID) missingVars.push('GMAIL_CLIENT_ID');
  if (!CLIENT_SECRET) missingVars.push('GMAIL_CLIENT_SECRET');
  if (!REDIRECT_URI) missingVars.push('REDIRECT_URI');
  
  return {
    isValid: missingVars.length === 0,
    missingVars: missingVars
  };
}

/**
 * Creates an error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @returns Response object
 */
export function createErrorResponse(message: string, status = 400, details: any = null) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      details: details,
      provider: 'gmail'
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Creates a success response
 * @param data Response data
 * @returns Response object
 */
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Handles CORS preflight requests
 * @returns Response for OPTIONS requests
 */
export function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Parses and validates the request body
 * @param req Request object
 * @returns Parsed body and action
 */
export async function parseRequest(req: Request) {
  let action = null;
  let body = {};
  
  // Parse request body if it's a POST request
  if (req.method === 'POST') {
    try {
      body = await req.json();
      action = body.action;
    } catch (e) {
      console.error('Error parsing request body:', e);
      throw new Error('Invalid JSON in request body');
    }
  } else {
    // Parse URL parameters if it's a GET request
    const url = new URL(req.url);
    action = url.searchParams.get('action');
  }
  
  return { action, body };
}
