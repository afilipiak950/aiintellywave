
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Invite user function called");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get authenticated user from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user from the auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !caller) {
      console.error("Invalid user token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", caller.id);

    // Check if caller has admin or manager role
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdminOrManager = callerRoles?.some(r => 
      r.role === "admin" || r.role === "manager"
    );

    if (!isAdminOrManager) {
      console.error("User does not have admin or manager role");
      return new Response(
        JSON.stringify({ error: "Insufficient permissions to invite users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received invite request:", JSON.stringify(requestData, null, 2));
    } catch (jsonError) {
      console.error("Error parsing request JSON:", jsonError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { email, role, name, company_id, language } = requestData;

    if (!email || !role) {
      console.error("Missing required fields:", { email, role });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate company_id is provided and is a valid UUID
    if (!company_id) {
      console.error("Missing company_id in request:", requestData);
      return new Response(
        JSON.stringify({ error: "Unternehmen-ID nicht gefunden. Bitte versuchen Sie es später erneut." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UUID validation regex pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(company_id)) {
      console.error("Invalid company_id format:", company_id);
      return new Response(
        JSON.stringify({ error: `Ungültiges Format für Unternehmen-ID: ${company_id}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify company exists
    const { data: companyCheck, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .eq('id', company_id)
      .single();
      
    if (companyError || !companyCheck) {
      console.error("Company not found:", company_id, companyError);
      return new Response(
        JSON.stringify({ error: `Unternehmen mit ID ${company_id} nicht gefunden` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Company found: ${companyCheck.name} (${companyCheck.id})`);

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create user in Supabase Auth
    let createUserResult;
    try {
      createUserResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: name || email.split('@')[0],
          company_id,
          role,
          language: language || 'de'
        }
      });
    } catch (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (createUserResult.error) {
      console.error("Error from auth.admin.createUser:", createUserResult.error);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createUserResult.error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUser = createUserResult.data.user;
    console.log("User created successfully:", newUser.id);

    // Add user to company_users table
    try {
      const { error: companyUserError } = await supabaseAdmin
        .from('company_users')
        .insert({
          user_id: newUser.id,
          company_id,
          role,
          is_admin: role === 'admin',
          email,
          full_name: name || email.split('@')[0],
          is_primary_company: true // Mark as primary company
        });

      if (companyUserError) {
        console.error('Error adding user to company:', companyUserError);
      }
    } catch (companyUserError) {
      console.error('Exception adding user to company:', companyUserError);
    }

    // Add user to user_roles table
    try {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role
        });

      if (roleError) {
        console.warn('Warning when adding user role:', roleError);
      }
    } catch (roleError) {
      console.warn('Exception when adding user role:', roleError);
    }

    // Send password reset email to let user set their own password
    try {
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email
      });

      if (resetError) {
        console.warn('Warning when sending password reset:', resetError);
      }
    } catch (resetError) {
      console.warn('Exception when sending password reset:', resetError);
    }

    // Track user activity
    try {
      await supabaseAdmin
        .from('user_activities')
        .insert({
          user_id: caller.id,
          entity_type: 'user',
          entity_id: newUser.id,
          action: 'invited user',
          details: {
            email,
            role,
            company_id,
            invited_by: caller.id
          }
        });
    } catch (activityError) {
      console.warn('Warning when tracking activity:', activityError);
    }

    // Return success response with user info (but not the temporary password)
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          role,
          company_id
        },
        message: "User invited successfully. A password reset email has been sent."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in invite-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
