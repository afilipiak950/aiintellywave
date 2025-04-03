
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './corsHeaders.ts';

// Create a Supabase client with authentication
export async function createSupabaseClient(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || '';
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase URL or service key');
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

// Create a response with error details
export function createErrorResponse(message: string, status = 400) {
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
