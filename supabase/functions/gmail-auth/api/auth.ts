
/**
 * Gmail API authentication functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import { testDomainConnectivity } from "../utils/network.ts";

// Configuration
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('REDIRECT_URI');

interface AuthorizationOptions {
  useLocalWindow?: boolean;
  display?: 'page' | 'popup' | 'touch' | 'wap';
  loginHint?: string;
  prompt?: 'none' | 'consent' | 'select_account';
}

/**
 * Generates OAuth authorization URL
 * @param options Optional parameters for the authorization URL
 * @returns Authorization URL for Gmail OAuth
 */
export function generateAuthorizationUrl(options: AuthorizationOptions = {}) {
  if (!CLIENT_ID) {
    throw new Error('GMAIL_CLIENT_ID environment variable is not set');
  }
  
  if (!REDIRECT_URI) {
    throw new Error('REDIRECT_URI environment variable is not set');
  }
  
  // Test valid URI format
  try {
    new URL(REDIRECT_URI);
  } catch (error) {
    throw new Error(`Invalid REDIRECT_URI format: ${REDIRECT_URI}`);
  }

  // We'll try both API endpoints to avoid potential DNS issues
  let authUrl;
  try {
    // First try the v2 auth endpoint
    authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  } catch (error) {
    // Fallback to the original auth endpoint
    authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  }
  
  // Add required parameters
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('access_type', 'offline');
  
  // Use options.prompt if provided, otherwise default to 'consent'
  authUrl.searchParams.append('prompt', options.prompt || 'consent');
  
  // Add optional display parameter if provided
  if (options.display) {
    authUrl.searchParams.append('display', options.display);
  }
  
  // Add login_hint if provided
  if (options.loginHint) {
    authUrl.searchParams.append('login_hint', options.loginHint);
  }
  
  // Add scope
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email');
  
  // Add state parameter to identify provider
  authUrl.searchParams.append('state', 'gmail'); 
  
  console.log('Gmail Auth: Generated auth URL:', authUrl.toString());
  
  return authUrl.toString();
}

/**
 * Exchanges authorization code for tokens with extensive error handling
 * @param code Authorization code
 * @returns Promise with token data
 */
export async function exchangeCodeForTokens(code: string) {
  console.log('Gmail Auth: Exchanging code for tokens...');
  
  // Validate environment variables
  if (!CLIENT_ID) {
    throw new Error('GMAIL_CLIENT_ID environment variable is not set');
  }
  
  if (!CLIENT_SECRET) {
    throw new Error('GMAIL_CLIENT_SECRET environment variable is not set');
  }
  
  if (!REDIRECT_URI) {
    throw new Error('REDIRECT_URI environment variable is not set');
  }
  
  try {
    // Test connectivity to accounts.google.com before making the token request
    try {
      console.log('Testing connectivity to accounts.google.com...');
      
      // Try multiple endpoints to check connectivity
      const endpointsToCheck = [
        'https://accounts.google.com/robots.txt',
        'https://accounts.google.com/ServiceLogin',
        'https://accounts.google.com/o/oauth2/auth'
      ];
      
      let connectivitySuccess = false;
      let connectivityError = '';
      
      for (const endpoint of endpointsToCheck) {
        try {
          console.log(`Trying to connect to ${endpoint}...`);
          const testRequest = await fetch(endpoint, {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': '*/*'
            }
          });
          
          if (testRequest.ok || testRequest.status === 404) {
            console.log(`Successfully connected to ${endpoint} with status ${testRequest.status}`);
            connectivitySuccess = true;
            break;
          } else {
            console.warn(`Connectivity test to ${endpoint} returned status: ${testRequest.status}`);
            connectivityError = `Status: ${testRequest.status}`;
          }
        } catch (endpointError: any) {
          console.error(`Connectivity test to ${endpoint} failed:`, endpointError.message);
          connectivityError = endpointError.message;
        }
      }
      
      if (!connectivitySuccess) {
        console.error(`Could not connect to any Google endpoints. Last error: ${connectivityError}`);
        // We don't throw here, we'll try the actual request anyway
      }
    } catch (connError: any) {
      console.error('Connectivity test to accounts.google.com failed:', connError.message);
      // We don't throw here, we'll try the actual request anyway
    }
    
    // Try multiple token endpoints with different configurations
    const tokenEndpoints = [
      'https://oauth2.googleapis.com/token',
      'https://www.googleapis.com/oauth2/v4/token',
      'https://accounts.google.com/o/oauth2/token'
    ];
    
    let lastError = null;
    
    for (const endpoint of tokenEndpoints) {
      try {
        console.log(`Attempting token exchange with endpoint: ${endpoint}`);
        
        // Log the request we're about to make for debugging
        console.log('Gmail Auth: Sending token request to Google with:', {
          code: code.substring(0, 5) + '...',
          client_id: CLIENT_ID.substring(0, 10) + '...',
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        });
        
        const tokenResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*'
          },
          body: new URLSearchParams({
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
          }),
        });
        
        // Log response status
        console.log(`Gmail Auth: Token response status from ${endpoint}:`, tokenResponse.status);
        
        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          console.error(`Gmail Auth: Token exchange error from ${endpoint}:`, errorData);
          lastError = errorData;
          continue; // Try the next endpoint
        }
        
        return await tokenResponse.json();
      } catch (error: any) {
        console.error(`Gmail Auth: Error in exchangeCodeForTokens with ${endpoint}:`, error);
        lastError = error;
        // Continue to the next endpoint
      }
    }
    
    // If we get here, all endpoints failed
    if (lastError) {
      if (lastError.error === 'invalid_grant') {
        throw new Error('The authorization code has expired or was already used. Please try connecting again.');
      }
      
      if (lastError.error === 'invalid_client') {
        throw new Error('Invalid client configuration. Please check the Gmail client ID and secret in your environment variables.');
      }
      
      if (lastError.error === 'redirect_uri_mismatch') {
        throw new Error(`Redirect URI mismatch. The configured URI (${REDIRECT_URI}) doesn't match what's registered in the Google Cloud Console.`);
      }
      
      throw new Error(`Token error: ${lastError.error || 'Unknown error'} - ${lastError.error_description || ''}`);
    }
    
    throw new Error('Failed to exchange code for tokens after trying multiple endpoints. This may be due to network connectivity issues or invalid credentials.');
  } catch (error: any) {
    console.error('Gmail Auth: Error in exchangeCodeForTokens:', error);
    throw error;
  }
}

/**
 * Refreshes access token if expired
 * @param refreshToken Refresh token
 * @returns Promise with refreshed token data
 */
export async function refreshAccessToken(refreshToken: string) {
  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID || '',
      client_secret: CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  const refreshData = await refreshResponse.json();
  
  if (refreshData.error) {
    throw new Error(`Token refresh error: ${refreshData.error}`);
  }
  
  return refreshData;
}
