
/**
 * Handler for token exchange requests
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import { createErrorResponse, createSuccessResponse } from "../utils/index.ts";
import { exchangeCodeForTokens, getUserInfo, storeTokensInDatabase } from "../api/index.ts";

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Handles token exchange request
 * @param body Request body
 * @returns Response with integration data
 */
export async function handleTokenRequest(body: any) {
  const { code, userId } = body;
  
  // Check for required Gmail environment variables
  const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID');
  const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET');
  const REDIRECT_URI = Deno.env.get('REDIRECT_URI');
  
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Gmail Auth: Missing required environment variables:', {
      GMAIL_CLIENT_ID_SET: !!GMAIL_CLIENT_ID,
      GMAIL_CLIENT_SECRET_SET: !!GMAIL_CLIENT_SECRET,
      REDIRECT_URI_SET: !!REDIRECT_URI,
      REDIRECT_URI: REDIRECT_URI || 'not set'
    });
    
    return createErrorResponse(
      'Gmail API configuration is incomplete. Required environment variables (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, REDIRECT_URI) are missing.',
      400
    );
  }
  
  if (!code) {
    return createErrorResponse('Authorization code is required');
  }
  
  try {
    console.log('Gmail Auth: Starting token exchange with code', code.substring(0, 5) + '...');
    const tokenData = await exchangeCodeForTokens(code);
    console.log('Gmail Auth: Token exchange successful, retrieving user info');
    const userInfo = await getUserInfo(tokenData.access_token);
    console.log('Gmail Auth: User info retrieved, storing in database');
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
