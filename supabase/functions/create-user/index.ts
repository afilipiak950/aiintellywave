
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the request body
    const body = await req.json();
    const { email, name, company_id, role } = body;

    if (!email || !company_id) {
      return new Response(
        JSON.stringify({ 
          error: "Email and company_id are required" 
        }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Creating user with email:", email, "for company:", company_id);

    // Generate a random password (for initial setup)
    const randomPassword = Math.random().toString(36).slice(-10);

    // Step 1: Create user in auth.users
    console.log("Step 1: Creating user in auth system");
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        language: 'en', // Explicitly set default language to English
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to create auth user: ${authError.message}` 
        }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log("Auth user created successfully:", authUser.user.id);

    // Step 2: Ensure the user has the correct role (this should be handled by trigger, but double-check)
    console.log("Step 2: Verifying company_user entry");
    const { data: companyUser, error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .select('*')
      .eq('user_id', authUser.user.id)
      .eq('company_id', company_id)
      .single();

    if (companyUserError && companyUserError.code !== 'PGRST116') {
      console.error("Error verifying company_user:", companyUserError);
      // Continue anyway as the trigger might handle it
    }

    // If no company_user entry exists (maybe trigger failed), create it manually
    if (!companyUser) {
      console.log("Creating company_user entry manually");
      const { error: insertError } = await supabaseAdmin
        .from('company_users')
        .insert({
          user_id: authUser.user.id,
          company_id,
          role: role || 'customer',
          email: email,
          full_name: name
        });

      if (insertError) {
        console.error("Error creating company_user entry:", insertError);
        // Don't return error here, let's try to complete the process
      }
    }

    // Step 3: Verify user_roles entry
    console.log("Step 3: Verifying user_roles entry");
    const { data: userRole, error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', authUser.user.id)
      .single();

    if (userRoleError && userRoleError.code !== 'PGRST116') {
      console.error("Error verifying user_role:", userRoleError);
      // Continue anyway as the trigger might handle it
    }

    // If no user_role entry exists, create it manually
    if (!userRole) {
      console.log("Creating user_role entry manually");
      const { error: insertRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authUser.user.id,
          role: role || 'customer'
        });

      if (insertRoleError) {
        console.error("Error creating user_role entry:", insertRoleError);
        // Don't return error here, let's try to complete the process
      }
    }

    // Step 4: Create or update user settings with English as default language
    console.log("Step 4: Creating user settings with English as default language");
    const { error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .insert({
        user_id: authUser.user.id,
        language: 'en', // Set English as default language
        theme: 'light',
        email_notifications: true,
        push_notifications: true
      })
      .on_conflict('user_id')
      .merge();

    if (settingsError) {
      console.error("Error creating/updating user settings:", settingsError);
      // Continue anyway, this is not a critical failure
    }

    console.log("User creation process completed successfully");
    
    return new Response(
      JSON.stringify({
        message: "User created successfully",
        userId: authUser.user.id,
        email: authUser.user.email
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return new Response(
      JSON.stringify({ 
        error: `Server error: ${error.message}` 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
