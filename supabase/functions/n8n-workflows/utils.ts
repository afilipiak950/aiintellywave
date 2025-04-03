
import { createClient } from "./supabaseClient.ts";

export async function getSupabaseClient(req: Request) {
  console.log("[n8n-workflows] Initializing Supabase client");
  // Initialize Supabase client with admin role for database operations
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get user JWT from request if available (for auth context)
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      console.log("[n8n-workflows] Setting auth context from request");
      const token = authHeader.replace('Bearer ', '');
      await supabaseAdmin.auth.setSession({ access_token: token, refresh_token: '' });
    } else {
      console.log("[n8n-workflows] No Authorization header found");
    }
  } catch (error) {
    console.warn("[n8n-workflows] Failed to set auth context:", error);
    // Continue with admin client anyway
  }
  
  return supabaseAdmin;
}
