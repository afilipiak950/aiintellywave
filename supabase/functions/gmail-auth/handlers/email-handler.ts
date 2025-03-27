
/**
 * Handler for email fetch requests
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import { createErrorResponse, createSuccessResponse } from "../utils.ts";
import { 
  fetchMessageList, 
  fetchMessageDetails, 
  processEmails,
  refreshAccessToken,
  updateTokenInDatabase 
} from "../gmail-api.ts";

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

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
