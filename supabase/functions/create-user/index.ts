
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { corsHeaders } from "./utils/cors.ts";
import { validatePayload, ValidationResult, UserData } from "./utils/validation.ts";
import { CompanyService, CompanyResult } from "./services/companyService.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Validate request method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "This endpoint only supports POST requests",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      }
    );
  }

  try {
    // Parse the request body
    const requestBody = await req.json().catch((e) => {
      console.error("Error parsing request body:", e);
      return null;
    });

    console.log("Received request payload:", JSON.stringify(requestBody));

    // Validate payload
    const validation: ValidationResult = validatePayload(requestBody);

    if (!validation.valid || !validation.data) {
      console.error("Validation failed:", validation.errorMessage);
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.errorMessage,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const userData: UserData = validation.data;
    console.log("Validated user data:", JSON.stringify(userData));

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists
    const { data: existingUsers, error: userCheckError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", userData.email)
      .limit(1);

    if (userCheckError) {
      console.error("Error checking for existing user:", userCheckError);
      // Continue with user creation attempt
    } else if (existingUsers && existingUsers.length > 0) {
      console.log("User already exists with email:", userData.email);
      return new Response(
        JSON.stringify({
          success: false,
          error: "User with this email already exists",
          user_id: existingUsers[0].id, // Return the existing user ID
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409, // Conflict
        }
      );
    }

    // Create user in auth.users
    let password = userData.password;
    if (!password) {
      // Generate random password if not provided
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      password = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      console.log("Generated random password for user");
    }

    console.log(`Creating user auth record for: ${userData.email}`);
    const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: userData.name || userData.email.split("@")[0],
        name: userData.name || userData.email.split("@")[0],
        company_id: userData.company_id || null,
        role: userData.role || "customer",
        language: userData.language || "en",
      },
    });

    if (createUserError) {
      console.error("Error creating user:", createUserError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create user: ${createUserError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!authUser?.user) {
      console.error("User creation succeeded but no user data returned");
      return new Response(
        JSON.stringify({
          success: false,
          error: "User creation succeeded but no user data returned",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log("User created successfully with id:", authUser.user.id);

    // If company ID is provided, associate user with company
    let companyResult: CompanyResult = { success: true };
    if (userData.company_id) {
      try {
        console.log(`Associating user ${authUser.user.id} with company ${userData.company_id}`);
        const companyService = new CompanyService(supabase);
        companyResult = await companyService.associateUserWithCompany(
          authUser.user.id,
          userData
        );

        if (!companyResult.success) {
          console.error("Error associating user with company:", companyResult.error);
        }
      } catch (error) {
        console.error("Exception in company association:", error);
        companyResult = {
          success: false,
          error: { message: error.message || "Unknown error in company association" },
        };
      }
    } else {
      console.log("No company ID provided, skipping company association");
    }

    // Return success response with user ID
    return new Response(
      JSON.stringify({
        success: true,
        user_id: authUser.user.id,
        company_association: companyResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (error) {
    console.error("Unexpected error in create-user function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
