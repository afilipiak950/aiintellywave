
/**
 * Response utilities for Gmail Auth edge function
 */

import { corsHeaders } from "./cors.ts";

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

