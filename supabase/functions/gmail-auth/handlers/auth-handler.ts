
/**
 * Handler for authorization requests
 */

import { testDomainConnectivity, createErrorResponse, createSuccessResponse } from "../utils/index.ts";
import { generateAuthorizationUrl } from "../api/index.ts";

/**
 * Handles authorization request
 * @param body Request body with optional parameters
 * @returns Response with authorization URL
 */
export async function handleAuthorizeRequest(body: any = {}) {
  try {
    // Check for required Gmail environment variables
    const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
    const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
    const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
    
    // Log all environment variables for debugging
    console.log('Gmail Auth: Environment variables check:', {
      GMAIL_CLIENT_ID_SET: !!GMAIL_CLIENT_ID,
      GMAIL_CLIENT_ID_LENGTH: GMAIL_CLIENT_ID ? GMAIL_CLIENT_ID.length : 0,
      GMAIL_CLIENT_ID_PREFIX: GMAIL_CLIENT_ID ? GMAIL_CLIENT_ID.substring(0, 10) + '...' : 'not set',
      GMAIL_CLIENT_SECRET_SET: !!GMAIL_CLIENT_SECRET,
      GMAIL_CLIENT_SECRET_LENGTH: GMAIL_CLIENT_SECRET ? GMAIL_CLIENT_SECRET.length : 0,
      GMAIL_CLIENT_SECRET_PREFIX: GMAIL_CLIENT_SECRET ? GMAIL_CLIENT_SECRET.substring(0, 5) + '...' : 'not set',
      REDIRECT_URI_SET: !!REDIRECT_URI,
      REDIRECT_URI: REDIRECT_URI || 'not set',
      SUPABASE_URL_SET: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_ANON_KEY_SET: !!Deno.env.get('SUPABASE_ANON_KEY')
    });
    
    if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !REDIRECT_URI) {
      return createErrorResponse(
        'Gmail API configuration is incomplete. Required environment variables (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, REDIRECT_URI) are missing.',
        400
      );
    }
    
    // Test connectivity to Google services
    try {
      const googleTest = await testDomainConnectivity('accounts.google.com');
      console.log('Connectivity test to accounts.google.com:', googleTest);
      
      if (!googleTest.success) {
        return createErrorResponse(`Unable to connect to Google authentication services: ${googleTest.error}. This may be due to network restrictions or firewall settings.`, 500);
      }
    } catch (connError: any) {
      console.error('Error testing connectivity:', connError);
      // Continue anyway, but log the error
    }
    
    // Extract options if provided
    const options = body?.options || {};
    console.log('Gmail Auth: Authorization options:', options);
    
    const authUrl = generateAuthorizationUrl(options);
    
    return createSuccessResponse({ url: authUrl });
  } catch (error: any) {
    console.error('Gmail Auth: Error generating authorization URL:', error);
    return createErrorResponse(`Failed to generate authorization URL: ${error.message}`, 500);
  }
}
