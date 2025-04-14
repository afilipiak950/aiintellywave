
import { UserCreationPayload } from '../utils/validation.ts';

// Service for handling authentication-related operations
export class AuthService {
  private supabaseClient: any;
  
  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }
  
  /**
   * Register a new user in the Supabase Auth system
   */
  async registerUser(userData: UserCreationPayload): Promise<{ success: boolean; userId?: string; error?: any; status?: number }> {
    console.log(`Registering new user with email: ${userData.email}`);
    
    try {
      // Create user in Supabase Auth with email confirmation disabled for testing
      const createUserOptions: any = {
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          full_name: userData.name, // Add full_name for compatibility
          role: userData.role,
          company_id: userData.company_id, // Store company_id in metadata (optional now)
          language: userData.language
        }
      };
      
      // Add password to options if provided
      if (userData.password) {
        createUserOptions.password = userData.password;
        console.log('Password provided for user creation');
      } else {
        console.log('No password provided, will use auto-generated password');
      }
      
      const { data, error } = await this.supabaseClient.auth.admin.createUser(createUserOptions);
      
      // Check for errors during user creation
      if (error) {
        console.error('Auth registration error:', JSON.stringify(error));
        return { 
          success: false, 
          error: `Authentication error: ${error.message}`,
          status: error.status || 500
        };
      }
      
      // Verify user data was returned
      if (!data?.user) {
        console.error('No user data returned after registration');
        return {
          success: false,
          error: 'User registration failed: No user data returned',
          status: 500
        };
      }
      
      console.log(`User registered successfully with ID: ${data.user.id}`);
      return {
        success: true,
        userId: data.user.id
      };
    } catch (error: any) {
      console.error('Exception during user registration:', error);
      return {
        success: false,
        error: `Registration exception: ${error.message}`,
        status: 500
      };
    }
  }
}
