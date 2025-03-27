
/**
 * Handler for diagnostic requests
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import {
  createErrorResponse,
  createSuccessResponse,
  testDomainConnectivity,
  validateEnvVars
} from "../utils.ts";
import { generateAuthorizationUrl } from "../api/index.ts";

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Performs diagnostic checks for Gmail OAuth configuration
 * @returns Response with diagnostic information
 */
export async function handleDiagnosticRequest() {
  try {
    console.log('Gmail Auth: Running diagnostic checks');
    
    // Validate environment variables
    const envValidation = validateEnvVars();
    
    // Test connectivity to critical domains
    const googleConnectivity = await testDomainConnectivity('accounts.google.com');
    const googleAPIConnectivity = await testDomainConnectivity('www.googleapis.com');
    const oauth2Connectivity = await testDomainConnectivity('oauth2.googleapis.com');
    
    let redirectDomain = "unknown";
    let redirectConnectivity = { success: false, error: "No REDIRECT_URI set" };
    
    // Only test redirect connectivity if we have a valid URI
    if (Deno.env.get('REDIRECT_URI')) {
      try {
        const redirectUrl = new URL(Deno.env.get('REDIRECT_URI') || '');
        redirectDomain = redirectUrl.hostname;
        redirectConnectivity = await testDomainConnectivity(redirectDomain);
      } catch (error) {
        redirectConnectivity = { 
          success: false, 
          error: `Invalid REDIRECT_URI format: ${Deno.env.get('REDIRECT_URI')}` 
        };
      }
    }
    
    // Get the constructed authorization URL (just for checking format)
    let authUrl = null;
    let authUrlFormatError = null;
    
    try {
      if (envValidation.isValid) {
        authUrl = generateAuthorizationUrl();
      }
    } catch (error: any) {
      authUrlFormatError = error.message;
    }
    
    // Try an actual network test to Google's servers
    let googleDirectTest = { success: false, error: "Not tested" };
    try {
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        headers: { 'User-Agent': 'Mozilla/5.0 (Lovable Edge Function)' }
      });
      googleDirectTest = {
        success: response.status === 204,
        error: response.status === 204 ? undefined : `Status: ${response.status}`
      };
    } catch (error: any) {
      googleDirectTest = { 
        success: false, 
        error: error.message || "Unknown error" 
      };
    }
    
    // Gather diagnostic info
    const diagnosticInfo = {
      environment: envValidation,
      connectivity: {
        'accounts.google.com': googleConnectivity,
        'www.googleapis.com': googleAPIConnectivity,
        'oauth2.googleapis.com': oauth2Connectivity,
        'www.google.com': googleDirectTest,
        [redirectDomain]: redirectConnectivity
      },
      authUrl: authUrl ? true : false,
      authUrlError: authUrlFormatError,
      redirect_uri: Deno.env.get('REDIRECT_URI'),
      timestamp: new Date().toISOString()
    };
    
    return createSuccessResponse({ 
      diagnostic: diagnosticInfo,
      message: "Diagnostic check completed"
    });
  } catch (error: any) {
    console.error('Gmail Auth: Error in diagnostic check:', error);
    return createErrorResponse(`Diagnostic error: ${error.message}`, 500);
  }
}
