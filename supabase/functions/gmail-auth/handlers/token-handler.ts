
/**
 * Handler for token exchange requests
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";
import { createErrorResponse, createSuccessResponse } from "../utils.ts";
import { exchangeCodeForTokens, getUserInfo, storeTokensInDatabase } from "../gmail-api.ts";

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
