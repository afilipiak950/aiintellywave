
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Configuration and constants
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'https://id-preview--de84bfc8-71b6-4a46-b79b-f5d8b06f53cf.lovable.app/customer/email-auth-callback';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Validates required environment variables
 * @returns Object with validation status and missing variables
 */
function validateEnvVars() {
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
function createErrorResponse(message, status = 400, details = null) {
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
function createSuccessResponse(data) {
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
function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

/**
 * Generates OAuth authorization URL
 * @returns Authorization URL for Gmail OAuth
 */
function generateAuthorizationUrl() {
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
async function exchangeCodeForTokens(code) {
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
async function getUserInfo(accessToken) {
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
async function storeTokensInDatabase(tokenData, userInfo, userId) {
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
async function refreshAccessToken(refreshToken) {
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
async function updateTokenInDatabase(integrationId, accessToken, expiresIn) {
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
async function fetchMessageList(accessToken, count) {
  const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const gmailData = await gmailResponse.json();
  
  if (gmailData.error) {
    throw new Error(`Gmail API error: ${gmailData.error.message}`);
  }
  
  return gmailData.messages?.slice(0, count).map(msg => msg.id) || [];
}

/**
 * Fetches message details in batches
 * @param accessToken Access token
 * @param messageIds Message IDs
 * @returns Promise with email data
 */
async function fetchMessageDetails(accessToken, messageIds) {
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
function processEmails(emails) {
  return emails.map(email => {
    const headers = email.payload?.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Extract email body (could be in different parts)
    let body = '';
    
    if (email.payload?.body && email.payload.body.data) {
      body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (email.payload?.parts) {
      const textPart = email.payload.parts.find(part => 
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

/**
 * Handles authorization request
 * @returns Response with authorization URL
 */
async function handleAuthorizeRequest() {
  try {
    // Log all environment variables for debugging
    console.log('Gmail Auth: Environment variables check:', {
      CLIENT_ID_SET: !!CLIENT_ID,
      CLIENT_SECRET_SET: !!CLIENT_SECRET,
      REDIRECT_URI_SET: !!REDIRECT_URI,
      SUPABASE_URL_SET: !!SUPABASE_URL,
      SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY,
      ACTUAL_REDIRECT_URI: REDIRECT_URI
    });
    
    const authUrl = generateAuthorizationUrl();
    
    return createSuccessResponse({ url: authUrl });
  } catch (error) {
    console.error('Gmail Auth: Error generating authorization URL:', error);
    return createErrorResponse(`Failed to generate authorization URL: ${error.message}`, 500);
  }
}

/**
 * Handles token exchange request
 * @param body Request body
 * @returns Response with integration data
 */
async function handleTokenRequest(body) {
  const { code, userId } = body;
  
  if (!code) {
    return createErrorResponse('Authorization code is required');
  }
  
  try {
    const tokenData = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokenData.access_token);
    const data = await storeTokensInDatabase(tokenData, userInfo, userId);
    
    return createSuccessResponse({
      integration: {
        id: data.id,
        provider: data.provider,
        email: data.email
      }
    });
  } catch (error) {
    console.error('Gmail Auth: Error during token exchange:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Handles email fetch request
 * @param body Request body
 * @returns Response with email data
 */
async function handleFetchRequest(body) {
  const { integrationId, count = 100 } = body;
  
  try {
    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('email_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();
    
    if (integrationError) {
      throw integrationError;
    }
    
    // Refresh token if needed
    let accessToken = integration.access_token;
    if (new Date(integration.expires_at) < new Date()) {
      const refreshData = await refreshAccessToken(integration.refresh_token);
      accessToken = refreshData.access_token;
      
      // Update token in database
      await updateTokenInDatabase(integrationId, refreshData.access_token, refreshData.expires_in);
    }
    
    // Fetch emails from Gmail API
    const messageIds = await fetchMessageList(accessToken, count);
    
    if (!messageIds.length) {
      return createSuccessResponse({ emails: [] });
    }
    
    const emailBatch = await fetchMessageDetails(accessToken, messageIds);
    const processedEmails = processEmails(emailBatch);
    
    return createSuccessResponse({ emails: processedEmails });
  } catch (error) {
    console.error('Gmail Auth: Error in fetch request:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Parses and validates the request body
 * @param req Request object
 * @returns Parsed body and action
 */
async function parseRequest(req) {
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

/**
 * Main request handler
 * @param req Request object
 * @returns Response object
 */
async function handleRequest(req) {
  console.log('Gmail Auth: Request received', {
    method: req.method,
    url: req.url
  });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // Validate environment variables first
    const envValidation = validateEnvVars();
    if (!envValidation.isValid) {
      console.error('Gmail auth: Missing required environment variables:', envValidation.missingVars);
      return createErrorResponse(`Missing required environment variables: ${envValidation.missingVars.join(', ')}`, 400);
    }

    // Parse and validate the request
    const { action, body } = await parseRequest(req);
    console.log('Gmail Auth: Processing request with action:', action);

    // Handle different actions
    switch (action) {
      case 'authorize':
        return await handleAuthorizeRequest();
      
      case 'token':
        return await handleTokenRequest(body);
      
      case 'fetch':
        return await handleFetchRequest(body);
      
      default:
        return createErrorResponse('Invalid action', 400);
    }
  } catch (error) {
    console.error('Error in gmail-auth function:', error);
    return createErrorResponse(error.message, 500);
  }
}

// Start the server
serve(handleRequest);
