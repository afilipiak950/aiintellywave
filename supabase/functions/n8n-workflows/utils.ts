
import { corsHeaders } from "./corsHeaders.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.41.1";

// Get Supabase client from request authorization
export async function getSupabaseClient(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error("[n8n-workflows] No authorization header provided");
      throw new Error("No authorization header provided");
    }
    
    // Extract JWT token
    const jwt = authHeader.replace('Bearer ', '');
    
    if (!jwt) {
      console.error("[n8n-workflows] No JWT token provided");
      throw new Error("No JWT token provided");
    }
    
    // Create Supabase client with JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[n8n-workflows] Missing Supabase environment variables");
      throw new Error("Supabase environment configuration is incomplete");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });
    
    return supabaseClient;
  } catch (error) {
    console.error("[n8n-workflows] Error creating Supabase client:", error);
    throw error;
  }
}

// Helper function to create error responses with CORS headers
export function createErrorResponse(message: string, status = 400, details?: any) {
  console.error(`[n8n-workflows] Error: ${message}`, details || '');
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details || undefined
    }),
    {
      status: status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
