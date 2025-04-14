
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
        .select('id, name')
        .eq('id', userData.company_id)
        .single();
      
      if (companyCheckError || !companyExists) {
        console.error(`Company with ID ${userData.company_id} does not exist:`, companyCheckError);
        return {
          success: false,
          error: { message: `Company with ID ${userData.company_id} not found` }
        };
      }
      
      // Check if we can determine the best company match based on email domain
      const isPrimaryCompany = this.isEmailDomainMatchingCompany(userData.email, companyExists.name);
      console.log(`Email domain match check: ${isPrimaryCompany ? 'Match found' : 'No match'} for ${userData.email} with ${companyExists.name}`);
      
      // Prepare the company user record
      const companyUserRecord = {
        user_id: userId,
        company_id: userData.company_id,
        role: userData.role,
        is_admin: userData.role === 'admin',
        email: userData.email,
        full_name: userData.name,
        is_primary_company: isPrimaryCompany, // Set based on email domain match
        is_manager_kpi_enabled: userData.role === 'manager' || userData.role === 'admin' // Enable KPI for managers/admins
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
  
  /**
   * Determine if email domain matches company name
   * This helper function checks for domain matches similar to the trigger
   */
  private isEmailDomainMatchingCompany(email: string, companyName: string): boolean {
    if (!email || !email.includes('@') || !companyName) {
      return false;
    }
    
    const domain = email.split('@')[1].toLowerCase();
    
    // Special case for specific email domains
    if (domain === 'fact-talents.de' && companyName.toLowerCase().includes('fact') && companyName.toLowerCase().includes('talent')) {
      return true;
    }
    
    if (domain === 'wbungert.com' && companyName.toLowerCase().includes('bungert')) {
      return true;
    }
    
    if (domain === 'teso-specialist.de' && companyName.toLowerCase().includes('teso') && companyName.toLowerCase().includes('specialist')) {
      return true;
    }
    
    const domainPrefix = domain.split('.')[0].toLowerCase();
    const companyNameLower = companyName.toLowerCase();
    
    // Check for exact match or partial matches
    return (
      domainPrefix === companyNameLower ||
      companyNameLower.includes(domainPrefix) ||
      domainPrefix.includes(companyNameLower)
    );
  }
}
