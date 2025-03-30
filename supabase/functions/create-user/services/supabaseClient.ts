
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseAdmin(): { client: any, error?: string } {
  console.log("Creating Supabase admin client");
  
  // Check if required environment variables are set
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return { client: null, error: 'Server configuration error' };
  }
  
  // Create a Supabase client with the Admin key
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
  console.log("Supabase client created successfully");
  
  return { client: supabaseAdmin };
}
