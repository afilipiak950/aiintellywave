
/**
 * Gmail API interactions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Configuration
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'https://id-preview--de84bfc8-71b6-4a46-b79b-f5d8b06f53cf.lovable.app/customer/email-auth-callback';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Generates OAuth authorization URL
 * @returns Authorization URL for Gmail OAuth
 */
export function generateAuthorizationUrl() {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', CLIENT_ID || '');
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
 * Exchanges authorization code for tokens
 * @param code Authorization code
 * @returns Promise with token data
 */
export async function exchangeCodeForTokens(code: string) {
  console.log('Gmail Auth: Exchanging code for tokens...');
  
  try {
    // Log the request we're about to make for debugging
    console.log('Gmail Auth: Sending token request to Google with:', {
      code: code.substring(0, 5) + '...',
      client_id: CLIENT_ID?.substring(0, 10) + '...',
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI || '',
        grant_type: 'authorization_code',
      }),
    });
    
    // Log response status
    console.log('Gmail Auth: Token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Gmail Auth: Token exchange error:', errorData);
      
      // Handle different error cases
      if (errorData.error === 'invalid_grant') {
        throw new Error('The authorization code has expired or was already used. Please try connecting again.');
      }
      
      if (errorData.error === 'invalid_client') {
        throw new Error('Invalid client configuration. Please check the Gmail client ID and secret in your environment variables.');
      }
      
      throw new Error(`Token error: ${errorData.error} - ${errorData.error_description || ''}`);
    }
    
    return await tokenResponse.json();
  } catch (error) {
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
