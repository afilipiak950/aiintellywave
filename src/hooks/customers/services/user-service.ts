
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';

/**
 * Fetch companies for non-admin user
 */
export async function fetchUserCompanies(userId: string, debug: CustomerDebugInfo) {
  console.log('Fetching companies for non-admin user');
  
  // For non-admins, only fetch companies they belong to
  const { data: userCompanies, error: userCompaniesError } = await supabase
    .from('company_users')
    .select('company_id')
    .eq('user_id', userId);
  
  if (userCompaniesError) {
    console.error('Error fetching user companies:', userCompaniesError);
    debug.errors = debug.errors || [];
    debug.errors.push({ type: 'user_companies', error: userCompaniesError });
    throw userCompaniesError;
  }
  
  if (!userCompanies || userCompanies.length === 0) {
    console.log('User does not belong to any companies');
    debug.userCompanyIds = [];
    return { companyIds: [], companiesData: [], companyUsersData: [] };
  }
  
  const companyIds = userCompanies.map(uc => uc.company_id);
  console.log('User belongs to these companies:', companyIds);
  debug.userCompanyIds = companyIds;
  
  // Fetch companies data
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      contact_email,
      contact_phone,
      city,
      country,
      description
    `)
    .in('id', companyIds);
  
  if (companiesError) {
    console.error('Error fetching companies data:', companiesError);
    debug.errors = debug.errors || [];
    debug.errors.push({ type: 'companies_in', error: companiesError });
    throw companiesError;
  }
  
  debug.companiesCount = companiesData?.length || 0;
  console.log('Fetched companies for user:', debug.companiesCount);
  
  // Get users from the same companies
  const { data: companyUsersData, error: usersError } = await supabase
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
        name
      )
    `)
    .in('company_id', companyIds);
  
  if (usersError) {
    console.error('Error fetching users in same companies:', usersError);
    debug.errors = debug.errors || [];
    debug.errors.push({ type: 'users_in_companies', error: usersError });
    throw usersError;
  }
  
  debug.companyUsersCount = companyUsersData?.length || 0;
  console.log('Fetched users in same companies:', debug.companyUsersCount);
  
  return {
    companyIds,
    companiesData: companiesData || [],
    companyUsersData: companyUsersData || []
  };
}
