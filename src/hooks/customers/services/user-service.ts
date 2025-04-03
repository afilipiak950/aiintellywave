
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';

/**
 * Fetch companies and users data for a specific user
 */
export async function fetchUserCompanies(userId: string, debug: CustomerDebugInfo) {
  console.log('Fetching companies data for user:', userId);
  
  try {
    // Get user's company IDs
    const { data: userCompanies, error: userCompaniesError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId);
      
    if (userCompaniesError) {
      console.error('Error fetching user companies:', userCompaniesError);
      throw userCompaniesError;
    }
    
    // Extract company IDs
    const companyIds = userCompanies?.map(uc => uc.company_id) || [];
    
    if (companyIds.length === 0) {
      console.warn('No companies found for user:', userId);
      return { companiesData: [], companyUsersData: [] };
    }
    
    // Fetch companies data
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .in('id', companyIds);
      
    if (companiesError) {
      console.error('Error fetching companies data:', companiesError);
      throw companiesError;
    }
    
    // Fetch company users data
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        companies:company_id (
          id,
          name,
          city,
          country,
          contact_email,
          contact_phone
        )
      `)
      .in('company_id', companyIds);
      
    if (companyUsersError) {
      console.error('Error fetching company users data:', companyUsersError);
      throw companyUsersError;
    }
    
    debug.companiesCount = companiesData?.length || 0;
    debug.companyUsersCount = companyUsersData?.length || 0;
    
    console.log(`Found ${debug.companiesCount} companies and ${debug.companyUsersCount} users for user ${userId}`);
    
    return { companiesData, companyUsersData };
  } catch (error) {
    console.error('Error in fetchUserCompanies:', error);
    throw error;
  }
}
