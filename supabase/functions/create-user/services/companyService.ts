
import { UserData } from '../utils/validation.ts';

export interface CompanyResult {
  success: boolean;
  error?: any;
}

export class CompanyService {
  private supabase: any;

  constructor(supabaseClient: any) {
    this.supabase = supabaseClient;
  }

  async associateUserWithCompany(userId: string, userData: UserData): Promise<CompanyResult> {
    try {
      console.log(`Associating user ${userId} with company ${userData.company_id}`);
      
      if (!userData.company_id) {
        return {
          success: false,
          error: { message: 'No company ID provided' }
        };
      }

      // Add user to company_users table
      const companyUserPayload = {
        user_id: userId,
        company_id: userData.company_id,
        role: userData.role || 'customer',
        is_admin: userData.role === 'admin',
        email: userData.email,
        full_name: userData.name || userData.email.split('@')[0],
        is_primary_company: true
      };
      
      const { error: companyUserError } = await this.supabase
        .from('company_users')
        .insert(companyUserPayload);

      if (companyUserError) {
        console.error('Error adding user to company_users:', companyUserError);
        return {
          success: false,
          error: companyUserError
        };
      }

      // Add user to user_roles table for role-based access
      const { error: roleError } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: userData.role || 'customer'
        });

      if (roleError) {
        console.warn('Warning: Could not add user role:', roleError);
        // Continue despite role error - this is non-critical
      }

      return { success: true };
    } catch (error) {
      console.error('Exception in company association:', error);
      return {
        success: false,
        error
      };
    }
  }
}
