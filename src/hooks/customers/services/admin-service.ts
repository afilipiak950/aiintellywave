
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';
import { repairCompanyUsers } from '../utils/company-users-debug';

/**
 * Fetch company data for administrators
 */
export async function fetchAdminCompanyData(debug: CustomerDebugInfo): Promise<any[]> {
  try {
    debug.checks.push({ name: 'fetchAdminCompanyData', started: true });
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      console.error('Error fetching companies for admin:', companiesError);
      debug.checks.push({ name: 'fetchAdminCompanyData', error: companiesError.message });
      throw companiesError;
    }
    
    debug.checks.push({ name: 'fetchAdminCompanyData', success: true, count: companies?.length || 0 });
    console.log(`Found ${companies?.length || 0} companies for admin`);
    
    return companies || [];
  } catch (error: any) {
    debug.checks.push({ name: 'fetchAdminCompanyData', error: error.message });
    return [];
  }
}

/**
 * Fetch company users data for administrators
 */
export async function fetchAdminCompanyUsers(debug: CustomerDebugInfo): Promise<any[]> {
  try {
    debug.checks.push({ name: 'fetchAdminCompanyUsers', started: true });
    
    const { data: companyUsers, error: companyUsersError } = await supabase
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
          description,
          contact_email,
          contact_phone,
          city,
          country
        )
      `);
    
    if (companyUsersError) {
      console.error('Error fetching company users for admin:', companyUsersError);
      debug.checks.push({ name: 'fetchAdminCompanyUsers', error: companyUsersError.message });
      throw companyUsersError;
    }
    
    debug.checks.push({ name: 'fetchAdminCompanyUsers', success: true, count: companyUsers?.length || 0 });
    console.log(`Found ${companyUsers?.length || 0} company-user associations for admin`);
    
    return companyUsers || [];
  } catch (error: any) {
    debug.checks.push({ name: 'fetchAdminCompanyUsers', error: error.message });
    return [];
  }
}

/**
 * Repair admin data
 */
export async function repairAdminData(userId: string, userEmail: string | undefined, debug: CustomerDebugInfo): Promise<boolean> {
  try {
    debug.checks.push({ name: 'repairAdminData', started: true });
    
    // First try repairing company users
    const repairResult = await repairCompanyUsers();
    
    if (repairResult.status === 'error') {
      debug.checks.push({ name: 'repairAdminData', error: repairResult.error });
      return false;
    }
    
    debug.checks.push({ 
      name: 'repairAdminData',
      success: true,
      result: {
        message: repairResult.message,
        companiesCount: Array.isArray(repairResult.companies) ? repairResult.companies.length : 0,
        associationsCount: Array.isArray(repairResult.associations) ? repairResult.associations.length : 0,
      }
    });
    
    return true;
  } catch (error: any) {
    debug.checks.push({ name: 'repairAdminData', error: error.message });
    return false;
  }
}

/**
 * Get count of company users
 */
export async function getCompanyUsersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error('Error counting company users:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getCompanyUsersCount:', error);
    return 0;
  }
}
