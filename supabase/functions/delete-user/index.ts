
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

// Set up Supabase client with admin privileges
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req: Request) => {
  try {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    // Parse the request body to get the user ID
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    console.log(`Delete-user function: Attempting to delete user ${userId}`);

    // First, delete from company_users table
    const { error: companyUsersError } = await supabaseAdmin
      .from('company_users')
      .delete()
      .eq('user_id', userId);
    
    if (companyUsersError) {
      console.error('Error deleting from company_users:', companyUsersError);
      // Continue with deletion even if this fails
    }
    
    // Delete from profiles table
    const { error: profilesError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profilesError) {
      console.error('Error deleting from profiles:', profilesError);
      // Continue with deletion even if this fails
    }
    
    // Delete from user_roles table
    const { error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (rolesError) {
      console.error('Error deleting from user_roles:', rolesError);
      // Continue with deletion even if this fails
    }

    // Finally, delete the user from auth.users using admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: authError.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unknown error occurred" 
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        }
      }
    );
  }
});
