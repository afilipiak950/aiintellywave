
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Gmail OAuth configuration
const CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // Generate authorization URL
    if (action === 'authorize') {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', CLIENT_ID || '');
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI || '');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');
      authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email');
      
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
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        throw new Error(`Token error: ${tokenData.error}`);
      }
      
      // Get user email from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });
      
      const userInfo = await userInfoResponse.json();
      
      // Store tokens in database
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
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
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
      
      // Fetch emails from Gmail API
      const gmailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${count}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const gmailData = await gmailResponse.json();
      
      if (gmailData.error) {
        throw new Error(`Gmail API error: ${gmailData.error.message}`);
      }
      
      // Get email details (in batches to avoid rate limits)
      const messageIds = gmailData.messages.slice(0, count).map(msg => msg.id);
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
      
      // Process emails and extract relevant fields
      const processedEmails = emailBatch.map(email => {
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
    console.error('Error in gmail-auth function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
