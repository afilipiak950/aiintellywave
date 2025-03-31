
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest, createResponse } from "./utils/cors.ts";
import { validatePayload } from "./utils/validation.ts";
import { initializeSupabaseAdmin } from "./services/supabaseClient.ts";
import { AuthService } from "./services/authService.ts";
import { CompanyService } from "./services/companyService.ts";
import { RoleService } from "./services/roleService.ts";

// Initialize all services outside the request handler for better reuse
let authService: AuthService;
let companyService: CompanyService;
let roleService: RoleService;

serve(async (req: Request) => {
  console.log("User creation request received");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  
  try {
    // PHASE 1: INITIALIZATION
    console.log("Phase 1: Initializing services");
    
    // Initialize Supabase client
    const { client: supabaseAdmin, error: clientError } = initializeSupabaseAdmin();
    if (clientError) {
      console.error("Supabase client initialization failed:", clientError);
      return createResponse({ error: clientError }, 500);
    }
    
    // Initialize services
    authService = new AuthService(supabaseAdmin);
    companyService = new CompanyService(supabaseAdmin);
    roleService = new RoleService(supabaseAdmin);
    
    // PHASE 2: REQUEST VALIDATION
    console.log("Phase 2: Parsing and validating request");
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed:", JSON.stringify(requestBody));
    } catch (parseError) {
      console.error("Request body parse error:", parseError);
      return createResponse({ error: "Invalid request format" }, 400);
    }
    
    // Validate payload
    const { valid, errorMessage, data } = validatePayload(requestBody);
    if (!valid || !data) {
      console.error("Payload validation failed:", errorMessage);
      return createResponse({ error: errorMessage }, 400);
    }
    
    // PHASE 3: USER CREATION PIPELINE
    console.log(`Phase 3: Creating user for email ${data.email}`);
    
    // Step 1: Create user in auth system
    console.log("Step 1: Creating user in auth system with data:", JSON.stringify({
      email: data.email,
      name: data.name,
      company_id: data.company_id,
      role: data.role,
      language: data.language
    }));
    
    try {
      const authResult = await authService.registerUser(data);
      if (!authResult.success) {
        console.error("User auth creation failed:", JSON.stringify(authResult.error));
        return createResponse(
          { error: authResult.error },
          authResult.status || 500
        );
      }
      
      const userId = authResult.userId!;
      console.log(`User created with ID: ${userId}`);
      
      // Prepare response (will be updated with additional info)
      const response = {
        id: userId,
        email: data.email,
        name: data.name,
        role: data.role,
        company_id: data.company_id,
        success: true,
        secondary_operations: { success: true }
      };
      
      // PHASE 4: SECONDARY OPERATIONS (non-blocking)
      console.log("Phase 4: Performing secondary operations");
      
      // Step 2: Associate user with company
      try {
        console.log(`Step 2: Associating user ${userId} with company ${data.company_id}`);
        const companyResult = await companyService.associateUserWithCompany(userId, data);
        if (!companyResult.success) {
          console.warn("Company association warning:", JSON.stringify(companyResult.error));
          response.secondary_operations = {
            success: false,
            company_error: companyResult.error?.message || "Unknown company association error"
          };
        }
      } catch (companyError) {
        console.error("Company association exception:", companyError);
        response.secondary_operations = {
          ...response.secondary_operations,
          success: false,
          company_error: companyError?.message || "Unknown company association error"
        };
      }
      
      // Step 3: Assign role to user
      try {
        console.log(`Step 3: Assigning role ${data.role} to user ${userId}`);
        const roleResult = await roleService.assignRoleToUser(userId, data.role);
        if (!roleResult.success) {
          console.warn("Role assignment warning:", JSON.stringify(roleResult.error));
          // Update or add to secondary operations status
          response.secondary_operations = {
            ...response.secondary_operations,
            success: false,
            role_error: roleResult.error?.message || "Unknown role assignment error"
          };
        }
      } catch (roleError) {
        console.error("Role assignment exception:", roleError);
        response.secondary_operations = {
          ...response.secondary_operations,
          success: false,
          role_error: roleError?.message || "Unknown role assignment error"
        };
      }
      
      console.log("User creation process completed successfully");
      
      // Return success response with user data
      return createResponse(response);
    } catch (authError) {
      console.error("Auth creation exception:", authError.stack || authError);
      return createResponse(
        { error: "Authentication error: " + (authError.message || "Unknown error") },
        500
      );
    }
    
  } catch (error: any) {
    // Global error handler for unexpected exceptions
    console.error("Unhandled exception in user creation:", error.stack || error);
    return createResponse(
      { error: "Internal server error: " + (error.message || "Unknown error") },
      500
    );
  }
});
