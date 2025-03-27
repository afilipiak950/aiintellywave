
/**
 * Request handlers for Gmail Auth edge function
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import {
  createErrorResponse,
  createSuccessResponse
} from "./utils.ts";
import {
  generateAuthorizationUrl,
  exchangeCodeForTokens,
  getUserInfo,
  storeTokensInDatabase,
  refreshAccessToken,
  updateTokenInDatabase,
  fetchMessageList,
  fetchMessageDetails,
  processEmails
} from "./gmail-api.ts";

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Handles authorization request
 * @returns Response with authorization URL
 */
export async function handleAuthorizeRequest() {
  try {
    // Log all environment variables for debugging
    console.log('Gmail Auth: Environment variables check:', {
      CLIENT_ID_SET: !!Deno.env.get('GMAIL_CLIENT_ID'),
      CLIENT_SECRET_SET: !!Deno.env.get('GMAIL_CLIENT_SECRET'),
      REDIRECT_URI_SET: !!Deno.env.get('REDIRECT_URI'),
      SUPABASE_URL_SET: !!SUPABASE_URL,
      SUPABASE_ANON_KEY_SET: !!SUPABASE_ANON_KEY,
      ACTUAL_REDIRECT_URI: Deno.env.get('REDIRECT_URI')
    });
    
    const authUrl = generateAuthorizationUrl();
    
    return createSuccessResponse({ url: authUrl });
  } catch (error: any) {
    console.error('Gmail Auth: Error generating authorization URL:', error);
    return createErrorResponse(`Failed to generate authorization URL: ${error.message}`, 500);
  }
}

/**
 * Handles token exchange request
 * @param body Request body
 * @returns Response with integration data
 */
export async function handleTokenRequest(body: any) {
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
  } catch (error: any) {
    console.error('Gmail Auth: Error during token exchange:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Handles email fetch request
 * @param body Request body
 * @returns Response with email data
 */
export async function handleFetchRequest(body: any) {
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
  } catch (error: any) {
    console.error('Gmail Auth: Error in fetch request:', error);
    return createErrorResponse(error.message, 500);
  }
}
