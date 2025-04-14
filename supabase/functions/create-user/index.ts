
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
  console.log("User creation request received - Note: This function is deprecated. Use supabase.auth.admin.createUser instead.");
  
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
      // Log request body with password masked
      const logBody = {...requestBody};
      if (logBody.password) {
        logBody.password = '********';
      }
      console.log("Request body parsed:", JSON.stringify(logBody));
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
    
    // Ensure company_id is provided
    if (!data.company_id) {
      console.error("Company ID is missing in the request");
      return createResponse({ 
        error: "company_id is required to create a user" 
      }, 400);
    }
    
    console.log("Validated payload with company_id:", data.company_id);
    
    // PHASE 3: USER CREATION PIPELINE - PRIMARY OPERATION
    console.log(`Phase 3: Creating user for email ${data.email} with company ${data.company_id}`);
    
    // Step 1: Create user in auth system - PRIMARY OPERATION
    const authResult = await authService.registerUser(data);
    if (!authResult.success) {
      console.error("User auth creation failed:", authResult.error);
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
      secondary_operations: { success: true, errors: [] }
    };
    
    // PHASE 4: SECONDARY OPERATIONS (non-blocking)
    console.log("Phase 4: Performing secondary operations");
    
    // Step 2: Associate user with company - SECONDARY OPERATION
    let companyResult;
    try {
      companyResult = await companyService.associateUserWithCompany(userId, data);
      if (!companyResult.success) {
        console.warn("Company association warning:", companyResult.error);
        response.secondary_operations.success = false;
        response.secondary_operations.errors = [
          ...(response.secondary_operations.errors || []),
          {
            operation: 'company_association',
            error: companyResult.error?.message || "Unknown company association error"
          }
        ];
      } else {
        console.log(`User ${userId} successfully associated with company ${data.company_id}`);
      }
    } catch (companyError) {
      console.error("Exception in company association:", companyError);
      response.secondary_operations.success = false;
      response.secondary_operations.errors = [
        ...(response.secondary_operations.errors || []),
        {
          operation: 'company_association',
          error: companyError.message || "Exception in company association",
          stack: companyError.stack
        }
      ];
    }
    
    // Step 3: Assign role to user - SECONDARY OPERATION
    let roleResult;
    try {
      roleResult = await roleService.assignRoleToUser(userId, data.role);
      if (!roleResult.success) {
        console.warn("Role assignment warning:", roleResult.error);
        response.secondary_operations.success = false;
        response.secondary_operations.errors = [
          ...(response.secondary_operations.errors || []),
          {
            operation: 'role_assignment',
            error: roleResult.error?.message || "Unknown role assignment error"
          }
        ];
      } else {
        console.log(`Role ${data.role} successfully assigned to user ${userId}`);
      }
    } catch (roleError) {
      console.error("Exception in role assignment:", roleError);
      response.secondary_operations.success = false;
      response.secondary_operations.errors = [
        ...(response.secondary_operations.errors || []),
        {
          operation: 'role_assignment',
          error: roleError.message || "Exception in role assignment",
          stack: roleError.stack
        }
      ];
    }
    
    console.log("User creation process completed successfully");
    
    // Always return 200 if primary operation succeeded, even if secondary operations failed
    return createResponse(response, 200);
    
  } catch (error: any) {
    // Global error handler for unexpected exceptions
    console.error("Unhandled exception in user creation:", error.stack || error);
    return createResponse(
      { error: "Internal server error: " + (error.message || "Unknown error") },
      500
    );
  }
});
