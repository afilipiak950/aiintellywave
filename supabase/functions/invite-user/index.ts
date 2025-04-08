
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
    // Initialize Supabase client with service role key
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

    // Get authenticated user from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current user from the auth header
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid user token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller has admin or manager role
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const isAdminOrManager = callerRoles?.some(r => 
      r.role === "admin" || r.role === "manager"
    );

    if (!isAdminOrManager) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions to invite users" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const requestData = await req.json();
    console.log("Received invite request:", JSON.stringify(requestData, null, 2));
    
    const { email, role, name, company_id, language } = requestData;

    if (!email || !role) {
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
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
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

    if (createError) {
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add user to company_users table
    const { error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .insert({
        user_id: newUser.user.id,
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

    // Add user to user_roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role
      });

    if (roleError) {
      console.warn('Warning when adding user role:', roleError);
    }

    // Send password reset email to let user set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email
    });

    if (resetError) {
      console.warn('Warning when sending password reset:', resetError);
    }

    // Return success response with user info (but not the temporary password)
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
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
