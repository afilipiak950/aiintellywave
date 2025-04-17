
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { UserData } from '../utils/validation.ts';

export interface CompanyResult {
  success: boolean;
  error?: any;
}

export class CompanyService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  async associateUserWithCompany(userId: string, userData: UserData): Promise<CompanyResult> {
    try {
      console.log(`Associating user ${userId} with company ${userData.company_id}`);

      // Verify company exists
      const { data: companyData, error: companyError } = await this.supabase
        .from('companies')
        .select('id')
        .eq('id', userData.company_id)
        .single();

      if (companyError || !companyData) {
        console.error('Company not found:', companyError);
        return {
          success: false,
          error: { message: `Company with ID ${userData.company_id} not found` },
        };
      }

      // Create company_users association
      const { error: associationError } = await this.supabase
        .from('company_users')
        .insert({
          user_id: userId,
          company_id: userData.company_id,
          role: userData.role || 'customer',
          is_admin: userData.role === 'admin',
          email: userData.email,
          full_name: userData.name || userData.email.split('@')[0],
          is_primary_company: true,
        });

      if (associationError) {
        console.error('Error creating company association:', associationError);
        return {
          success: false,
          error: associationError,
        };
      }

      console.log(`User ${userId} successfully associated with company ${userData.company_id}`);
      return { success: true };
    } catch (error) {
      console.error('Exception in company association:', error);
      return {
        success: false,
        error: { message: error.message || 'Unknown error in company association' },
      };
    }
  }
}
