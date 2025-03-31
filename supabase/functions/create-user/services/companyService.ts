
import { UserCreationPayload } from '../utils/validation.ts';

// Service for handling company-related operations
export class CompanyService {
  private supabaseClient: any;
  
  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }
  
  /**
   * Associate a user with a company in the company_users table
   */
  async associateUserWithCompany(
    userId: string, 
    userData: UserCreationPayload
  ): Promise<{ success: boolean; error?: any }> {
    console.log(`Associating user ${userId} with company ${userData.company_id}`);
    
    try {
      if (!userData.company_id) {
        console.warn('No company ID provided for association');
        return { 
          success: false, 
          error: { message: 'No company ID provided for association' } 
        };
      }
      
      const companyUserRecord = {
        user_id: userId,
        company_id: userData.company_id,
        role: userData.role,
        is_admin: userData.role === 'admin',
        email: userData.email,
        full_name: userData.name
      };
      
      console.log('Creating company user record:', JSON.stringify(companyUserRecord));
      
      const { error, data } = await this.supabaseClient
        .from('company_users')
        .insert(companyUserRecord)
        .select();
      
      if (error) {
        console.warn('Error associating user with company:', JSON.stringify(error));
        return { success: false, error };
      }
      
      console.log('User successfully associated with company, result:', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.warn('Exception in company association:', error.stack || error);
      return { success: false, error };
    }
  }
}
