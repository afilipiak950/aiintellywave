
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

export async function getSupabaseClient(req: Request) {
  // Extract the JWT token from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[n8n-workflows:utils] No valid authorization header found');
  }
  
  const token = authHeader?.split(' ')[1] || '';
  
  // Get Supabase URL and service role key from environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('[n8n-workflows:utils] Missing Supabase environment variables');
    throw new Error('Server configuration error');
  }
  
  // Create Supabase client with auth token
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  });
}
