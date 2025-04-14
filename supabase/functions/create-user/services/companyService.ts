
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
      console.log(`No company_id provided, attempting to find a match based on email domain for user ${userId}`);
      
      // Try to find a matching company based on email domain
      const matchedCompanyId = await this.findCompanyByEmailDomain(userData.email);
      
      if (matchedCompanyId) {
        console.log(`Found matching company ${matchedCompanyId} for email domain in ${userData.email}`);
        userData.company_id = matchedCompanyId;
      } else {
        // If no match found, try to use the first company in the system
        const { data: firstCompany, error: firstCompanyError } = await this.supabaseClient
          .from('companies')
          .select('id, name')
          .order('created_at', { ascending: true })
          .limit(1)
          .single();
          
        if (firstCompanyError || !firstCompany) {
          console.error(`No companies found in the system for user ${userId}`);
          return { 
            success: false, 
            error: { message: "No companies available for association" }
          };
        }
        
        console.log(`Using first available company ${firstCompany.id} for user ${userId}`);
        userData.company_id = firstCompany.id;
      }
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
      
      // Also try to add an entry to user_roles for compatibility
      try {
        await this.supabaseClient
          .from('user_roles')
          .insert({
            user_id: userId,
            role: userData.role
          });
      } catch (roleError) {
        console.warn('Could not add user_roles entry, but continuing:', roleError);
        // Don't fail the whole operation if this fails
      }
      
      console.log('User successfully associated with company');
      return { success: true };
    } catch (error) {
      console.warn('Exception in company association:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Find a company ID based on email domain
   */
  private async findCompanyByEmailDomain(email: string): Promise<string | null> {
    if (!email || !email.includes('@')) {
      return null;
    }
    
    const domain = email.split('@')[1].toLowerCase();
    const domainPrefix = domain.split('.')[0].toLowerCase();
    
    // Special case handling for specific domains
    if (domain === 'fact-talents.de') {
      const { data } = await this.supabaseClient
        .from('companies')
        .select('id')
        .ilike('name', '%fact%')
        .ilike('name', '%talent%')
        .limit(1)
        .single();
      
      if (data) return data.id;
    }
    
    if (domain === 'wbungert.com') {
      const { data } = await this.supabaseClient
        .from('companies')
        .select('id')
        .ilike('name', '%bungert%')
        .limit(1)
        .single();
      
      if (data) return data.id;
    }
    
    if (domain === 'teso-specialist.de') {
      const { data } = await this.supabaseClient
        .from('companies')
        .select('id')
        .ilike('name', '%teso%')
        .limit(1)
        .single();
      
      if (data) return data.id;
    }
    
    // General domain matching
    const { data } = await this.supabaseClient
      .from('companies')
      .select('id, name')
      .order('created_at')
      .limit(10);
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Try to find a match based on company name
    for (const company of data) {
      const companyNameLower = company.name.toLowerCase();
      if (
        domainPrefix === companyNameLower ||
        companyNameLower.includes(domainPrefix) ||
        domainPrefix.includes(companyNameLower)
      ) {
        return company.id;
      }
    }
    
    return null;
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
    
    if (domain === 'teso-specialist.de' && companyName.toLowerCase().includes('teso')) {
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
