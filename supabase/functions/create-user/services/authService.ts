
import { UserCreationPayload } from '../utils/validation.ts';

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
      console.log('Creating auth user with data:', JSON.stringify({
        email: userData.email,
        name: userData.name,
        role: userData.role,
        company_id: userData.company_id,
        language: userData.language
      }));
      
      // Create the user with admin.createUser (more privileges than auth.signUp)
      const { data, error } = await this.supabaseClient.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role,
          company_id: userData.company_id,
          language: userData.language || 'en'
        }
      });
      
      if (error) {
        console.error('Auth registration error details:', JSON.stringify(error));
        return { 
          success: false, 
          error: `Authentication error: ${error.message || 'Unknown error'}`,
          status: error.status || 500
        };
      }
      
      if (!data.user) {
        console.error('No user data returned from createUser');
        return { 
          success: false, 
          error: 'User creation failed: No user data returned',
          status: 500
        };
      }
      
      console.log(`User successfully created with ID: ${data.user.id}`);
      return { success: true, userId: data.user.id };
    } catch (error) {
      console.error('Exception in user registration:', error.stack || error);
      return { 
        success: false, 
        error: `Authentication error: ${error.message || 'Unknown error'}`,
        status: 500
      };
    }
  }
}
