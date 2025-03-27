
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Gmail OAuth configuration
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('REDIRECT_URI') || 'https://id-preview--de84bfc8-71b6-4a46-b79b-f5d8b06f53cf.lovable.app/customer/email-auth-callback';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Validate required environment variables
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

// Generate OAuth authorization URL
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

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code: string) {
  console.log('Gmail Auth: Exchanging code for tokens...');
  
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
  
  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    console.error('Gmail Auth: Token exchange error:', errorData);
    
    // Handle different error cases
    if (errorData.error === 'invalid_grant') {
      throw new Error('The authorization code has expired or was already used. Please try connecting again.');
    }
    
    if (errorData.error === 'invalid_client') {
      throw new Error('Invalid client configuration. Please contact your administrator to check the Gmail client ID and secret.');
    }
    
    throw new Error(`Token error: ${errorData.error} - ${errorData.error_description || ''}`);
  }
  
  return await tokenResponse.json();
}

// Get user information from Google
async function getUserInfo(accessToken: string) {
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!userInfoResponse.ok) {
    const errorData = await userInfoResponse.json();
    console.error('Gmail Auth: User info error:', errorData);
    throw new Error(`Failed to get user info: ${errorData.error}`);
  }
  
  return await userInfoResponse.json();
}

// Store tokens in database
async function storeTokensInDatabase(tokenData: any, userInfo: any, userId: string) {
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

// Refresh access token if expired
async function refreshAccessToken(refreshToken: string) {
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

// Update token in database
async function updateTokenInDatabase(integrationId: string, accessToken: string, expiresIn: number) {
  await supabase
    .from('email_integrations')
    .update({
      access_token: accessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq('id', integrationId);
}

// Fetch message list from Gmail API
async function fetchMessageList(accessToken: string, count: number) {
  const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  const gmailData = await gmailResponse.json();
  
  if (gmailData.error) {
    throw new Error(`Gmail API error: ${gmailData.error.message}`);
  }
  
  return gmailData.messages.slice(0, count).map(msg => msg.id);
}

// Fetch message details in batches
async function fetchMessageDetails(accessToken: string, messageIds: string[]) {
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

// Process and format email data
function processEmails(emails: any[]) {
  return emails.map(email => {
    const headers = email.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    
    // Extract email body (could be in different parts)
    let body = '';
    
    if (email.payload.body && email.payload.body.data) {
      body = atob(email.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    } else if (email.payload.parts) {
      const textPart = email.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      
      if (textPart && textPart.body.data) {
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

// Handle authorization request
async function handleAuthorizeRequest() {
  const authUrl = generateAuthorizationUrl();
  
  return new Response(JSON.stringify({ 
    url: authUrl 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Handle token exchange request
async function handleTokenRequest(body: any) {
  const { code, userId } = body;
  
  if (!code) {
    throw new Error('Authorization code is required');
  }
  
  try {
    const tokenData = await exchangeCodeForTokens(code);
    const userInfo = await getUserInfo(tokenData.access_token);
    const data = await storeTokensInDatabase(tokenData, userInfo, userId);
    
    return new Response(JSON.stringify({ 
      success: true,
      integration: {
        id: data.id,
        provider: data.provider,
        email: data.email
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Gmail Auth: Error during token exchange:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      provider: 'gmail'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Handle email fetch request
async function handleFetchRequest(body: any) {
  const { integrationId, count = 100 } = body;
  
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
  const emailBatch = await fetchMessageDetails(accessToken, messageIds);
  const processedEmails = processEmails(emailBatch);
  
  return new Response(JSON.stringify({ 
    success: true,
    emails: processedEmails
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables first
    const envValidation = validateEnvVars();
    if (!envValidation.isValid) {
      console.error('Gmail auth: Missing required environment variables:', envValidation.missingVars);
      return new Response(
        JSON.stringify({
          error: `Missing required environment variables: ${envValidation.missingVars.join(', ')}`,
          provider: 'gmail'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url);
    let action = url.searchParams.get('action');
    let body = {};
    
    // Parse request body if it's a POST request
    if (req.method === 'POST') {
      try {
        body = await req.json();
        action = body.action;
      } catch (e) {
        console.error('Error parsing request body:', e);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid JSON in request body',
            provider: 'gmail'
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

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
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          provider: 'gmail'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in gmail-auth function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      provider: 'gmail' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
