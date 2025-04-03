
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';

// Create a response with consistent error formatting
export function createErrorResponse(message: string, status = 400) {
  console.error(`[n8n-workflows] Error: ${message}`);
  return new Response(
    JSON.stringify({
      success: false,
      error: message
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// Get a Supabase client for the function to use (with auth from the request)
export async function getSupabaseClient(req: Request) {
  try {
    // Create Supabase client with auth context from the request
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase URL or service key');
    }
    
    // Create a Supabase client with the Authorization header from the request
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    
    return supabase;
  } catch (error: any) {
    console.error(`[n8n-workflows] Error creating Supabase client: ${error.message}`);
    throw error;
  }
}
