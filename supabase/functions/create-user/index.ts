
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCorsOptions } from "./utils/cors.ts";
import { validateUserPayload } from "./utils/validation.ts";
import { createSupabaseAdmin } from "./services/supabaseClient.ts";
import { createAuthUser, addUserToCompany, addUserRole } from "./services/userService.ts";

serve(async (req) => {
  console.log("Request received for create-user function")
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)')
    return handleCorsOptions();
  }
  
  try {
    console.log("Starting user creation process")
    
    // Create Supabase client
    const { client: supabaseAdmin, error: clientError } = createSupabaseAdmin();
    if (clientError) {
      return new Response(
        JSON.stringify({ error: clientError }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log(`Request body:`, JSON.stringify(body));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Validate payload
    const { isValid, error: validationError, payload } = validateUserPayload(body);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Creating user with email: ${payload.email} for company: ${payload.company_id}`);
    
    // Step 1: Create auth user
    const authResult = await createAuthUser(supabaseAdmin, payload);
    if (!authResult.success) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: authResult.status || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const userId = authResult.userId;
    
    // After this point, we consider user creation successful and will return 200
    // even if secondary operations fail
    
    // Step 2: Add user to company_users table
    const companyUserResult = await addUserToCompany(supabaseAdmin, userId, payload);
    const companyUserError = companyUserResult.success ? null : companyUserResult.error;
    
    // Step 3: Add user to user_roles table
    const userRoleResult = await addUserRole(supabaseAdmin, userId, payload.role);
    const userRoleError = userRoleResult.success ? null : userRoleResult.error;
    
    console.log('User creation process completed successfully');
    
    // Always return 200 here - the main user was created successfully
    return new Response(
      JSON.stringify({ 
        id: userId, 
        email: payload.email, 
        name: payload.name, 
        company_id: payload.company_id,
        role: payload.role,
        success: true,
        company_user_error: companyUserError ? companyUserError.message : null,
        user_role_error: userRoleError ? 
          (typeof userRoleError === 'object' && userRoleError.message ? 
            userRoleError.message : JSON.stringify(userRoleError)) : null
      }),
      {
        status: 200, // Always use 200 for successful user creation
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unhandled error in create-user function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
