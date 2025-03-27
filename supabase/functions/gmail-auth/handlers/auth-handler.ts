
/**
 * Handler for authorization requests
 */

import { testDomainConnectivity, createErrorResponse, createSuccessResponse } from "../utils/index.ts";
import { generateAuthorizationUrl } from "../api/index.ts";

/**
 * Handles authorization request
 * @returns Response with authorization URL
 */
export async function handleAuthorizeRequest() {
  try {
    // Log all environment variables for debugging
    console.log('Gmail Auth: Environment variables check:', {
      CLIENT_ID_SET: !!Deno.env.get('GMAIL_CLIENT_ID'),
      CLIENT_SECRET_SET: !!Deno.env.get('GMAIL_CLIENT_SECRET'),
      REDIRECT_URI_SET: !!Deno.env.get('REDIRECT_URI'),
      SUPABASE_URL_SET: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_ANON_KEY_SET: !!Deno.env.get('SUPABASE_ANON_KEY'),
      ACTUAL_REDIRECT_URI: Deno.env.get('REDIRECT_URI')
    });
    
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
    
    const authUrl = generateAuthorizationUrl();
    
    return createSuccessResponse({ url: authUrl });
  } catch (error: any) {
    console.error('Gmail Auth: Error generating authorization URL:', error);
    return createErrorResponse(`Failed to generate authorization URL: ${error.message}`, 500);
  }
}
