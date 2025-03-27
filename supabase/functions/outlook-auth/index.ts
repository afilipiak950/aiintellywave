
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Microsoft Graph OAuth configuration
const CLIENT_ID = Deno.env.get('OUTLOOK_CLIENT_ID') || 'f9b3fb36-6e5c-4f1b-9275-d39fe1e93447';
const CLIENT_SECRET = Deno.env.get('OUTLOOK_CLIENT_SECRET');
const TENANT_ID = Deno.env.get('OUTLOOK_TENANT_ID') || '4f0661cc-4773-430e-9784-4cea99b3b077';
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

serve(async (req) => {
  console.log('Outlook Auth: Request received', { method: req.method, url: req.url });
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Outlook Auth: Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Debug: Log environment variables (without revealing secrets)
    console.log('Outlook Auth: Environment variables check', { 
      CLIENT_ID_SET: !!CLIENT_ID,
      CLIENT_SECRET_SET: !!CLIENT_SECRET,
      TENANT_ID_SET: !!TENANT_ID,
      REDIRECT_URI_SET: !!REDIRECT_URI,
      SUPABASE_URL_SET: !!SUPABASE_URL,
      SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY
    });
    
    // Comprehensive environment variable checks
    const requiredEnvVars = [
      { name: 'OUTLOOK_CLIENT_ID', value: CLIENT_ID },
      { name: 'OUTLOOK_CLIENT_SECRET', value: CLIENT_SECRET },
      { name: 'REDIRECT_URI', value: REDIRECT_URI }
    ];

    const missingVars = requiredEnvVars.filter(v => !v.value);
    if (missingVars.length > 0) {
      console.error('Outlook Auth: Missing environment variables:', missingVars.map(v => v.name).join(', '));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Missing environment variables: ${missingVars.map(v => v.name).join(', ')}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Parse the request to determine the action
    let action;
    let body = {};
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
      console.log('Outlook Auth: GET request with action', action);
    } else {
      try {
        body = await req.json();
        action = body.action;
        console.log('Outlook Auth: POST request with action', action);
      } catch (e) {
        console.error('Outlook Auth: Error parsing request body:', e);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate authorization URL
    if (action === 'authorize') {
      console.log('Outlook Auth: Generating authorization URL');
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.append('client_id', CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('response_mode', 'query');
      authUrl.searchParams.append('scope', 'offline_access Mail.Read User.Read');
      authUrl.searchParams.append('state', 'outlook');
      
      console.log('Outlook Auth: Generated authorization URL:', authUrl.toString());
      
      return new Response(JSON.stringify({ 
        url: authUrl.toString() 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Exchange code for tokens
    if (action === 'token') {
      const { code, userId } = body;
      
      if (!code) {
        console.error('Outlook Auth: Missing authorization code');
        return new Response(
          JSON.stringify({ success: false, error: 'Authorization code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!userId) {
        console.error('Outlook Auth: Missing user ID');
        return new Response(
          JSON.stringify({ success: false, error: 'User ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Outlook Auth: Exchanging code for token');
      
      try {
        const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        console.log('Outlook Auth: Token request URL:', tokenUrl);
        
        const tokenParams = new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET || '',
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        });
        
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
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to exchange code for token: ${tokenResponse.status} ${tokenResponse.statusText}`,
              details: errorText
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          console.error('Outlook Auth: Token data error:', tokenData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Token error: ${tokenData.error} - ${tokenData.error_description}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Outlook Auth: Successfully obtained token');
        
        // Get user email from Microsoft Graph
        console.log('Outlook Auth: Fetching user info from Microsoft Graph');
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });
        
        console.log('Outlook Auth: User info response status:', userInfoResponse.status);
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error('Outlook Auth: User info error response:', errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to get user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`,
              details: errorText
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const userInfo = await userInfoResponse.json();
        
        if (userInfo.error) {
          console.error('Outlook Auth: User info data error:', userInfo);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `User info error: ${userInfo.error.message}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Outlook Auth: Got user info:', { 
          mail: userInfo.mail || 'undefined', 
          userPrincipalName: userInfo.userPrincipalName || 'undefined' 
        });
        
        // Store tokens in database
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
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Database error: ${error.message}` 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Outlook Auth: Integration stored successfully');
        
        return new Response(JSON.stringify({ 
          success: true,
          integration: {
            id: data.id,
            provider: data.provider,
            email: data.email
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Outlook Auth: Error in token exchange:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Token exchange error: ${error.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Fetch emails
    if (action === 'fetch') {
      const { integrationId, count = 100 } = body;
      
      if (!integrationId) {
        console.error('Outlook Auth: Missing integration ID');
        return new Response(
          JSON.stringify({ success: false, error: 'Integration ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('Outlook Auth: Fetching emails for integration:', integrationId);
      
      try {
        // Get integration details
        const { data: integration, error: integrationError } = await supabase
          .from('email_integrations')
          .select('*')
          .eq('id', integrationId)
          .single();
        
        if (integrationError) {
          console.error('Outlook Auth: Error fetching integration:', integrationError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Database error: ${integrationError.message}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Outlook Auth: Found integration for email:', integration.email);
        
        // Refresh token if needed
        let accessToken = integration.access_token;
        if (new Date(integration.expires_at) < new Date()) {
          console.log('Outlook Auth: Token expired, refreshing');
          
          try {
            const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                client_id: CLIENT_ID || '',
                client_secret: CLIENT_SECRET || '',
                refresh_token: integration.refresh_token,
                grant_type: 'refresh_token',
              }),
            });
            
            console.log('Outlook Auth: Refresh token response status:', refreshResponse.status);
            
            if (!refreshResponse.ok) {
              const errorText = await refreshResponse.text();
              console.error('Outlook Auth: Refresh token error response:', errorText);
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Failed to refresh token: ${refreshResponse.status} ${refreshResponse.statusText}`,
                  details: errorText
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            const refreshData = await refreshResponse.json();
            
            if (refreshData.error) {
              console.error('Outlook Auth: Refresh token data error:', refreshData);
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  error: `Token refresh error: ${refreshData.error}` 
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            
            accessToken = refreshData.access_token;
            
            // Update token in database
            const { error: updateError } = await supabase
              .from('email_integrations')
              .update({
                access_token: refreshData.access_token,
                expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
              })
              .eq('id', integrationId);
              
            if (updateError) {
              console.error('Outlook Auth: Error updating token in database:', updateError);
              // Not returning error here as we still have a valid token for this request
            } else {
              console.log('Outlook Auth: Token updated in database');
            }
          } catch (error) {
            console.error('Outlook Auth: Error refreshing token:', error);
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Token refresh error: ${error.message}` 
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
        
        // Fetch emails from Microsoft Graph API
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
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to fetch messages: ${messagesResponse.status} ${messagesResponse.statusText}`,
              details: errorText
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const messagesData = await messagesResponse.json();
        
        if (messagesData.error) {
          console.error('Outlook Auth: Messages data error:', messagesData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Microsoft Graph API error: ${messagesData.error.message}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log('Outlook Auth: Fetched', messagesData.value.length, 'emails');
        
        // Process emails
        const processedEmails = messagesData.value.map(email => {
          return {
            id: email.id,
            subject: email.subject,
            from: email.from?.emailAddress?.address,
            to: email.toRecipients?.map(r => r.emailAddress?.address).join(', '),
            date: email.receivedDateTime,
            body: email.body?.content?.substring(0, 10000) || email.bodyPreview, // Limit body size
          };
        });
        
        return new Response(JSON.stringify({ 
          success: true,
          emails: processedEmails
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Outlook Auth: Error fetching emails:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Email fetch error: ${error.message}` 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    console.error('Outlook Auth: Invalid or missing action:', action);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid or missing action parameter' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Outlook Auth: Unhandled error in outlook-auth function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unhandled error: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
