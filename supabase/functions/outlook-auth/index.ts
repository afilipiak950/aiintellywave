
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Microsoft Graph OAuth configuration
const CLIENT_ID = Deno.env.get('OUTLOOK_CLIENT_ID') || 'f9b3fb36-6e5c-4f1b-9275-d39fe1e93447';
const CLIENT_SECRET = Deno.env.get('OUTLOOK_CLIENT_SECRET');
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if environment variables are set
    if (!CLIENT_ID) {
      console.error('OUTLOOK_CLIENT_ID is not set');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OUTLOOK_CLIENT_ID environment variable is not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!CLIENT_SECRET) {
      console.error('OUTLOOK_CLIENT_SECRET is not set');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OUTLOOK_CLIENT_SECRET environment variable is not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!REDIRECT_URI) {
      console.error('REDIRECT_URI is not set');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'REDIRECT_URI environment variable is not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request to determine the action
    let action;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action');
    } else {
      try {
        const body = await req.json();
        action = body.action;
      } catch (e) {
        console.error('Error parsing request body:', e);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate authorization URL
    if (action === 'authorize') {
      const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
      authUrl.searchParams.append('client_id', CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('response_mode', 'query');
      authUrl.searchParams.append('scope', 'offline_access Mail.Read User.Read');
      authUrl.searchParams.append('state', 'outlook');
      
      return new Response(JSON.stringify({ 
        url: authUrl.toString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Exchange code for tokens
    if (action === 'token') {
      const { code, userId } = await req.json();
      
      if (!code) {
        throw new Error('Authorization code is required');
      }
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log('Exchanging code for token with Microsoft Graph API');
      
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET || '',
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Token error:', tokenData);
        throw new Error(`Token error: ${tokenData.error} - ${tokenData.error_description}`);
      }
      
      // Get user email from Microsoft Graph
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      const userInfo = await userInfoResponse.json();
      
      if (userInfo.error) {
        console.error('User info error:', userInfo);
        throw new Error(`User info error: ${userInfo.error.message}`);
      }
      
      // Store tokens in database
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
        console.error('Supabase insert error:', error);
        throw error;
      }
      
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
    }
    
    // Fetch emails
    if (action === 'fetch') {
      const { integrationId, count = 100 } = await req.json();
      
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
        
        const refreshData = await refreshResponse.json();
        
        if (refreshData.error) {
          throw new Error(`Token refresh error: ${refreshData.error}`);
        }
        
        accessToken = refreshData.access_token;
        
        // Update token in database
        await supabase
          .from('email_integrations')
          .update({
            access_token: refreshData.access_token,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', integrationId);
      }
      
      // Fetch emails from Microsoft Graph API
      const messagesResponse = await fetch(
        `https://graph.microsoft.com/v1.0/me/messages?$top=${count}&$select=id,subject,from,toRecipients,receivedDateTime,body,bodyPreview`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const messagesData = await messagesResponse.json();
      
      if (messagesData.error) {
        throw new Error(`Microsoft Graph API error: ${messagesData.error.message}`);
      }
      
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in outlook-auth function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
