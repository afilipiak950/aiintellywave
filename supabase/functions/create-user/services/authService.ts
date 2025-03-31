
import { UserCreationPayload } from "../utils/validation.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

export class AuthService {
  private supabaseAdmin: SupabaseClient;
  
  constructor(supabaseAdmin: SupabaseClient) {
    this.supabaseAdmin = supabaseAdmin;
  }
  
  async registerUser(userData: UserCreationPayload) {
    try {
      console.log("AuthService: Registering new user with email", userData.email);
      
      // Create the user in auth.users
      const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password || "TemporaryPassword123!", // Default password if not provided
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          full_name: userData.name,
          company_id: userData.company_id,
          role: userData.role || "customer",
          language: userData.language || "en",
          address: userData.address,   // Add address to user metadata
          city: userData.city,         // Add city to user metadata
          country: userData.country,   // Add country to user metadata
        },
      });
      
      if (error) {
        console.error("AuthService: Failed to create user:", error);
        return { 
          success: false, 
          error: error, 
          status: 400 
        };
      }
      
      if (!data.user) {
        console.error("AuthService: No user returned after creation");
        return { 
          success: false, 
          error: new Error("No user data returned"), 
          status: 500 
        };
      }
      
      console.log("AuthService: User created successfully with ID:", data.user.id);
      
      return {
        success: true,
        userId: data.user.id,
        email: data.user.email,
      };
    } catch (error: any) {
      console.error("AuthService: Exception in registerUser:", error);
      return {
        success: false,
        error: error,
        status: 500
      };
    }
  }
}
