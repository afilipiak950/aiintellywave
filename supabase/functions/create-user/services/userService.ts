
import { UserCreationPayload } from "../utils/validation.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";

export class UserService {
  private supabaseAdmin: SupabaseClient;
  
  constructor(supabaseAdmin: SupabaseClient) {
    this.supabaseAdmin = supabaseAdmin;
  }
  
  async updateUserProfile(userId: string, userData: UserCreationPayload) {
    try {
      console.log("UserService: Updating user profile for user", userId);
      
      const firstName = userData.name.split(' ')[0];
      const lastName = userData.name.split(' ').slice(1).join(' ') || '';
      
      const { data, error } = await this.supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          first_name: firstName,
          last_name: lastName,
          position: userData.role,
          address: userData.address, // Save address to profile
        });
      
      if (error) {
        console.error("UserService: Failed to update profile:", error);
        return { 
          success: false, 
          error: error 
        };
      }
      
      console.log("UserService: User profile updated successfully");
      return {
        success: true
      };
    } catch (error: any) {
      console.error("UserService: Exception in updateUserProfile:", error);
      return {
        success: false,
        error: error
      };
    }
  }
}
