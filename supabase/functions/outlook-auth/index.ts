
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Configuration and constants
const CLIENT_ID = Deno.env.get('OUTLOOK_CLIENT_ID') || 'f9b3fb36-6e5c-4f1b-9275-d39fe1e93447';
const CLIENT_SECRET = Deno.env.get('OUTLOOK_CLIENT_SECRET');
const TENANT_ID = Deno.env.get('OUTLOOK_TENANT_ID') || '4f0661cc-4773-430e-9784-4cea99b3b077';
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'https://id-preview--de84bfc8-71b6-4a46-b79b-f5d8b06f53cf.lovable.app/customer/email-auth-callback';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Validates required environment variables
 * @returns Object with validation status and missing variables
 */
function validateEnvironmentVars() {
  const requiredEnvVars = [
    { name: 'OUTLOOK_CLIENT_ID', value: CLIENT_ID },
    { name: 'OUTLOOK_CLIENT_SECRET', value: CLIENT_SECRET },
    { name: 'REDIRECT_URI', value: REDIRECT_URI }
  ];

  const missingVars = requiredEnvVars.filter(v => !v.value);
  return {
    isValid: missingVars.length === 0,
    missingVars: missingVars.map(v => v.name)
  };
}

/**
 * Logs environment variables without revealing secrets
 */
function logEnvironmentStatus() {
  console.log('Outlook Auth: Environment variables check', { 
    CLIENT_ID_SET: !!CLIENT_ID,
    CLIENT_SECRET_SET: !!CLIENT_SECRET,
    TENANT_ID_SET: !!TENANT_ID,
    REDIRECT_URI_SET: !!REDIRECT_URI,
    SUPABASE_URL_SET: !!SUPABASE_URL,
    SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY
  });
}

/**
 * Creates an error response
 * @param message Error message
 * @param status HTTP status code
 * @param details Additional error details
 * @returns Response object
 */
function createErrorResponse(message: string, status = 400, details?: any) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      details: details,
      provider: 'outlook'
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
function createSuccessResponse(data: any) {
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
  console.log('Outlook Auth: Handling CORS preflight request');
  return new Response(null, { headers: corsHeaders });
}

/**
 * Generates an authorization URL for OAuth flow
 * @returns Response with the authorization URL
 */
function generateAuthorizationUrl() {
  console.log('Outlook Auth: Generating authorization URL');
  
  const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  authUrl.searchParams.append('client_id', CLIENT_ID);
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('response_mode', 'query');
  authUrl.searchParams.append('scope', 'offline_access Mail.Read User.Read');
  authUrl.searchParams.append('state', 'outlook');
  
  console.log('Outlook Auth: Generated authorization URL:', authUrl.toString());
  
  return createSuccessResponse({ url: authUrl.toString() });
}

/**
 * Exchanges authorization code for access and refresh tokens
 * @param code The authorization code from OAuth redirect
 * @returns Promise with token data
 */
async function exchangeCodeForTokens(code: string) {
  console.log('Outlook Auth: Exchanging code for tokens');
  
  const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  const tokenParams = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET || '',
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  });
  
  console.log('Outlook Auth: Token request URL:', tokenUrl);
  console.log('Outlook Auth: Token request params:', {
    code: '***REDACTED***',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });
  
  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams,
  });
  
  console.log('Outlook Auth: Token response status:', tokenResponse.status);
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Outlook Auth: Token error response:', errorText);
    throw new Error(`Failed to exchange code for token: ${tokenResponse.status} ${tokenResponse.statusText}`);
  }
  
  const tokenData = await tokenResponse.json();
  
  if (tokenData.error) {
    console.error('Outlook Auth: Token data error:', tokenData);
    throw new Error(`Token error: ${tokenData.error} - ${tokenData.error_description}`);
  }
  
  console.log('Outlook Auth: Successfully obtained token');
  return tokenData;
}

/**
 * Fetches user info from Microsoft Graph API
 * @param accessToken Access token for Microsoft Graph API
 * @returns Promise with user info
 */
async function fetchUserInfo(accessToken: string) {
  console.log('Outlook Auth: Fetching user info from Microsoft Graph');
  
  const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  console.log('Outlook Auth: User info response status:', userInfoResponse.status);
  
  if (!userInfoResponse.ok) {
    const errorText = await userInfoResponse.text();
    console.error('Outlook Auth: User info error response:', errorText);
    throw new Error(`Failed to get user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
  }
  
  const userInfo = await userInfoResponse.json();
  
  if (userInfo.error) {
    console.error('Outlook Auth: User info data error:', userInfo);
    throw new Error(`User info error: ${userInfo.error.message}`);
  }
  
  console.log('Outlook Auth: Got user info:', { 
    mail: userInfo.mail || 'undefined', 
    userPrincipalName: userInfo.userPrincipalName || 'undefined' 
  });
  
  return userInfo;
}

/**
 * Stores integration data in the database
 * @param userId User ID
 * @param tokenData Token data from OAuth flow
 * @param userInfo User info from Microsoft Graph API
 * @returns Promise with the database record
 */
async function storeIntegrationInDatabase(userId: string, tokenData: any, userInfo: any) {
  console.log('Outlook Auth: Storing integration in database');
  
  const { data, error } = await supabase
    .from('email_integrations')
    .insert([{
      user_id: userId,
      provider: 'outlook',
      email: userInfo.mail || userInfo.userPrincipalName,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Outlook Auth: Supabase insert error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
  
  console.log('Outlook Auth: Integration stored successfully');
  return data;
}

/**
 * Handles token exchange and user registration
 * @param code Authorization code
 * @param userId User ID
 * @returns Response with the integration data
 */
async function handleTokenExchange(code: string, userId: string) {
  try {
    const tokenData = await exchangeCodeForTokens(code);
    const userInfo = await fetchUserInfo(tokenData.access_token);
    const data = await storeIntegrationInDatabase(userId, tokenData, userInfo);
    
    return createSuccessResponse({
      integration: {
        id: data.id,
        provider: data.provider,
        email: data.email
      }
    });
  } catch (error: any) {
    console.error('Outlook Auth: Error in token exchange:', error);
    return createErrorResponse(`Token exchange error: ${error.message}`, 500);
  }
}

/**
 * Refreshes an access token
 * @param refreshToken Refresh token
 * @returns Promise with the refreshed token data
 */
async function refreshAccessToken(refreshToken: string) {
  console.log('Outlook Auth: Refreshing token');
  
  const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
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
  
  console.log('Outlook Auth: Refresh token response status:', refreshResponse.status);
  
  if (!refreshResponse.ok) {
    const errorText = await refreshResponse.text();
    console.error('Outlook Auth: Refresh token error response:', errorText);
    throw new Error(`Failed to refresh token: ${refreshResponse.status} ${refreshResponse.statusText}`);
  }
  
  const refreshData = await refreshResponse.json();
  
  if (refreshData.error) {
    console.error('Outlook Auth: Refresh token data error:', refreshData);
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
async function updateTokenInDatabase(integrationId: string, accessToken: string, expiresIn: number) {
  const { error } = await supabase
    .from('email_integrations')
    .update({
      access_token: accessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq('id', integrationId);
    
  if (error) {
    console.error('Outlook Auth: Error updating token in database:', error);
    // Not throwing error as we still have a valid token for this request
  } else {
    console.log('Outlook Auth: Token updated in database');
  }
}

/**
 * Fetches emails from Microsoft Graph API
 * @param accessToken Access token
 * @param count Number of emails to fetch
 * @returns Promise with the email data
 */
async function fetchEmails(accessToken: string, count: number) {
  console.log('Outlook Auth: Fetching emails from Microsoft Graph');
  const messagesUrl = `https://graph.microsoft.com/v1.0/me/messages?$top=${count}&$select=id,subject,from,toRecipients,receivedDateTime,body,bodyPreview`;
  console.log('Outlook Auth: Messages request URL:', messagesUrl);
  
  const messagesResponse = await fetch(messagesUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  console.log('Outlook Auth: Messages response status:', messagesResponse.status);
  
  if (!messagesResponse.ok) {
    const errorText = await messagesResponse.text();
    console.error('Outlook Auth: Messages error response:', errorText);
    throw new Error(`Failed to fetch messages: ${messagesResponse.status} ${messagesResponse.statusText}`);
  }
  
  const messagesData = await messagesResponse.json();
  
  if (messagesData.error) {
    console.error('Outlook Auth: Messages data error:', messagesData);
    throw new Error(`Microsoft Graph API error: ${messagesData.error.message}`);
  }
  
  console.log('Outlook Auth: Fetched', messagesData.value.length, 'emails');
  
  return messagesData.value;
}

/**
 * Processes and formats emails
 * @param emails Raw email data
 * @returns Processed email data
 */
function processEmails(emails: any[]) {
  return emails.map(email => {
    return {
      id: email.id,
      subject: email.subject,
      from: email.from?.emailAddress?.address,
      to: email.toRecipients?.map(r => r.emailAddress?.address).join(', '),
      date: email.receivedDateTime,
      body: email.body?.content?.substring(0, 10000) || email.bodyPreview, // Limit body size
    };
  });
}

/**
 * Handles email fetching
 * @param integrationId Integration ID
 * @param count Number of emails to fetch
 * @returns Response with the email data
 */
async function handleEmailFetch(integrationId: string, count: number = 100) {
  try {
    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('email_integrations')
      .select('*')
      .eq('id', integrationId)
      .single();
    
    if (integrationError) {
      console.error('Outlook Auth: Error fetching integration:', integrationError);
      return createErrorResponse(`Database error: ${integrationError.message}`);
    }
    
    console.log('Outlook Auth: Found integration for email:', integration.email);
    
    // Refresh token if needed
    let accessToken = integration.access_token;
    if (new Date(integration.expires_at) < new Date()) {
      try {
        const refreshData = await refreshAccessToken(integration.refresh_token);
        accessToken = refreshData.access_token;
        await updateTokenInDatabase(integrationId, refreshData.access_token, refreshData.expires_in);
      } catch (error: any) {
        console.error('Outlook Auth: Error refreshing token:', error);
        return createErrorResponse(`Token refresh error: ${error.message}`, 500);
      }
    }
    
    // Fetch and process emails
    const rawEmails = await fetchEmails(accessToken, count);
    const processedEmails = processEmails(rawEmails);
    
    return createSuccessResponse({ emails: processedEmails });
  } catch (error: any) {
    console.error('Outlook Auth: Error fetching emails:', error);
    return createErrorResponse(`Email fetch error: ${error.message}`, 500);
  }
}

/**
 * Parses the request body
 * @param req Request object
 * @returns Promise with the request body
 */
async function parseRequestBody(req: Request) {
  try {
    return await req.json();
  } catch (e) {
    console.error('Outlook Auth: Error parsing request body:', e);
    throw new Error('Invalid request body');
  }
}

/**
 * Main request handler
 * @param req Request object
 * @returns Response object
 */
async function handleRequest(req: Request): Promise<Response> {
  console.log('Outlook Auth: Request received', { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    logEnvironmentStatus();
    
    // Validate environment variables
    const envValidation = validateEnvironmentVars();
    if (!envValidation.isValid) {
      console.error('Outlook Auth: Missing environment variables:', envValidation.missingVars.join(', '));
      return createErrorResponse(`Missing environment variables: ${envValidation.missingVars.join(', ')}`, 500);
    }
    
    // Parse request to determine action
    let action;
    let body = {};
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
      console.log('Outlook Auth: GET request with action', action);
    } else {
      try {
        body = await parseRequestBody(req);
        action = body.action;
        console.log('Outlook Auth: POST request with action', action);
      } catch (e: any) {
        return createErrorResponse(e.message, 400);
      }
    }

    // Handle different actions
    switch (action) {
      case 'authorize':
        return generateAuthorizationUrl();
      
      case 'token': {
        const { code, userId } = body;
        
        if (!code) {
          console.error('Outlook Auth: Missing authorization code');
          return createErrorResponse('Authorization code is required');
        }
        
        if (!userId) {
          console.error('Outlook Auth: Missing user ID');
          return createErrorResponse('User ID is required');
        }
        
        return await handleTokenExchange(code, userId);
      }
      
      case 'fetch': {
        const { integrationId, count = 100 } = body;
        
        if (!integrationId) {
          console.error('Outlook Auth: Missing integration ID');
          return createErrorResponse('Integration ID is required');
        }
        
        return await handleEmailFetch(integrationId, count);
      }
      
      default:
        console.error('Outlook Auth: Invalid or missing action:', action);
        return createErrorResponse('Invalid or missing action parameter');
    }
  } catch (error: any) {
    console.error('Outlook Auth: Unhandled error in outlook-auth function:', error);
    return createErrorResponse(`Unhandled error: ${error.message}`, 500);
  }
}

// Start the server
serve(handleRequest);
