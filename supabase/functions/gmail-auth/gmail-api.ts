
/**
 * Gmail API interactions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Configuration
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
// Set a fallback redirect URI for development but prioritize the environment variable
const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Generates OAuth authorization URL
 * @returns Authorization URL for Gmail OAuth
 */
export function generateAuthorizationUrl() {
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
  
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email');
  authUrl.searchParams.append('state', 'gmail'); // Add state parameter to identify provider
  
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
 * Gets user information from Google
 * @param accessToken Access token
 * @returns Promise with user info
 */
export async function getUserInfo(accessToken: string) {
  try {
    console.log('Gmail Auth: Fetching user info with token');
    
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('Gmail Auth: User info response status:', userInfoResponse.status);
    
    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error('Gmail Auth: User info error:', errorData);
      throw new Error(`Failed to get user info: ${errorData.error}`);
    }
    
    return await userInfoResponse.json();
  } catch (error) {
    console.error('Gmail Auth: Error in getUserInfo:', error);
    throw error;
  }
}

/**
 * Stores tokens in database
 * @param tokenData Token data
 * @param userInfo User info
 * @param userId User ID
 * @returns Promise with integration data
 */
export async function storeTokensInDatabase(tokenData: any, userInfo: any, userId: string) {
  const { data, error } = await supabase
    .from('email_integrations')
    .insert([{
      user_id: userId,
      provider: 'gmail',
      email: userInfo.email,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Gmail Auth: Database error when storing tokens:', error);
    throw error;
  }
  
  return data;
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

/**
 * Updates token in database
 * @param integrationId Integration ID
 * @param accessToken New access token
 * @param expiresIn Token expiration time in seconds
 */
export async function updateTokenInDatabase(integrationId: string, accessToken: string, expiresIn: number) {
  await supabase
    .from('email_integrations')
    .update({
      access_token: accessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq('id', integrationId);
}

/**
 * Fetches message list from Gmail API
 * @param accessToken Access token
 * @param count Number of messages to fetch
 * @returns Promise with message IDs
 */
export async function fetchMessageList(accessToken: string, count: number) {
  const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const gmailData = await gmailResponse.json();
  
  if (gmailData.error) {
    throw new Error(`Gmail API error: ${gmailData.error.message}`);
  }
  
  return gmailData.messages?.slice(0, count).map((msg: any) => msg.id) || [];
}

/**
 * Fetches message details in batches
 * @param accessToken Access token
 * @param messageIds Message IDs
 * @returns Promise with email data
 */
export async function fetchMessageDetails(accessToken: string, messageIds: string[]) {
  const emailBatch = [];
  
  for (let i = 0; i < messageIds.length; i += 10) {
    const batch = messageIds.slice(i, i + 10);
    const batchPromises = batch.map(id => 
      fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }).then(res => res.json())
    );
    
    const batchResults = await Promise.all(batchPromises);
    emailBatch.push(...batchResults);
  }
  
  return emailBatch;
}

/**
 * Processes and formats email data
 * @param emails Raw email data
 * @returns Processed email data
 */
export function processEmails(emails: any[]) {
  return emails.map(email => {
    const headers = email.payload?.headers || [];
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
    const from = headers.find((h: any) => h.name === 'From')?.value || '';
    const to = headers.find((h: any) => h.name === 'To')?.value || '';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';
    
    // Extract email body (could be in different parts)
    let body = '';
    
    if (email.payload?.body && email.payload.body.data) {
      body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (email.payload?.parts) {
      const textPart = email.payload.parts.find((part: any) => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      
      if (textPart && textPart.body?.data) {
        body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
    }
    
    return {
      id: email.id,
      threadId: email.threadId,
      subject,
      from,
      to,
      date,
      body: body.substring(0, 10000), // Limit body size
    };
  });
}
