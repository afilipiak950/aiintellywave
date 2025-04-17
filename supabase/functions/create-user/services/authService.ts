
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { UserData } from '../utils/validation.ts';

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: any;
  status?: number;
}

export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async registerUser(userData: UserData): Promise<AuthResult> {
    try {
      console.log('Registering new user with email:', userData.email);

      // Check if password is provided
      let password: string;
      if (userData.password) {
        console.log('Password provided for user creation');
        password = userData.password;
      } else {
        // Generate a random password if not provided
        password = Math.random().toString(36).slice(-12);
        console.log('Generated random password for user');
      }

      // Create user with auth admin API
      const { data, error } = await this.supabase.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: userData.name,
          name: userData.name,
          role: userData.role,
          company_id: userData.company_id,
          language: userData.language || 'en',
        },
      });

      if (error) {
        console.error('Auth registration error:', JSON.stringify(error));
        return {
          success: false,
          error: error.message,
          status: error.status || 500,
        };
      }

      if (!data.user) {
        console.error('No user returned from auth registration');
        return {
          success: false,
          error: 'No user returned from registration',
          status: 500,
        };
      }

      console.log('User registered successfully with ID:', data.user.id);
      return {
        success: true,
        userId: data.user.id,
      };
    } catch (error) {
      console.error('Exception in auth registration:', error);
      return {
        success: false,
        error: error.message || 'Unknown error in user registration',
        status: 500,
      };
    }
  }
}
