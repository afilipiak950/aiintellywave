
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Create a Supabase admin client with the service role key
 */
export function initializeSupabaseAdmin(): { client: any; error?: string } {
  console.log("Initializing Supabase admin client");
  
  // Get required environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  // Validate environment variables
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables for Supabase client');
    return { 
      client: null, 
      error: 'Server configuration error: Missing Supabase credentials' 
    };
  }
  
  // Create client with admin privileges using service role key
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  console.log("Supabase admin client initialized successfully");
  
  return { client: adminClient };
}
