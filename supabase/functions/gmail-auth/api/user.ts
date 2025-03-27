
/**
 * Gmail API user information retrieval functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.17.0";

// Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// Supabase client for database operations
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

/**
 * Gets user information from Google
 * @param accessToken Access token
 * @returns Promise with user info
 */
export async function getUserInfo(accessToken: string) {
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
export async function storeTokensInDatabase(tokenData: any, userInfo: any, userId: string) {
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
 * Updates token in database
 * @param integrationId Integration ID
 * @param accessToken New access token
 * @param expiresIn Token expiration time in seconds
 */
export async function updateTokenInDatabase(integrationId: string, accessToken: string, expiresIn: number) {
  await supabase
    .from('email_integrations')
    .update({
      access_token: accessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    })
    .eq('id', integrationId);
}
