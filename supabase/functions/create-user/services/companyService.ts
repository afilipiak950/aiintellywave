
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
    if (!userData.company_id) {
      console.error(`Cannot associate user: Missing company_id for user ${userId}`);
      return { 
        success: false, 
        error: { message: "company_id is required for user association" }
      };
    }
    
    console.log(`Associating user ${userId} with company ${userData.company_id}`);
    
    try {
      // First verify the company exists
      const { data: companyExists, error: companyCheckError } = await this.supabaseClient
        .from('companies')
        .select('id')
        .eq('id', userData.company_id)
        .single();
      
      if (companyCheckError || !companyExists) {
        console.error(`Company with ID ${userData.company_id} does not exist`);
        return {
          success: false,
          error: { message: `Company with ID ${userData.company_id} not found` }
        };
      }
      
      const companyUserRecord = {
        user_id: userId,
        company_id: userData.company_id,
        role: userData.role,
        is_admin: userData.role === 'admin',
        email: userData.email,
        full_name: userData.name,
        is_primary_company: true // Mark as primary company
      };
      
      console.log('Creating company user record:', JSON.stringify(companyUserRecord));
      
      const { error } = await this.supabaseClient
        .from('company_users')
        .insert(companyUserRecord);
      
      if (error) {
        console.warn('Error associating user with company:', JSON.stringify(error));
        return { success: false, error };
      }
      
      console.log('User successfully associated with company');
      return { success: true };
    } catch (error) {
      console.warn('Exception in company association:', error);
      return { success: false, error };
    }
  }
}
