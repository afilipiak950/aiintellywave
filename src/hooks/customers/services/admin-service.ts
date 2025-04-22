
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';
import { repairCompanyUsers } from '../utils/company-users-debug';

/**
 * Fetch company data for administrators
 */
export async function fetchAdminCompanyData(debug: CustomerDebugInfo): Promise<any[]> {
  try {
    debug.checks.push({ 
      name: 'fetchAdminCompanyData', 
      result: true,
      message: 'Starting admin company data fetch' 
    });
    
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (companiesError) {
      console.error('Error fetching companies for admin:', companiesError);
      debug.checks.push({ 
        name: 'fetchAdminCompanyData', 
        result: companiesError.message,
        message: `Error: ${companiesError.message}` 
      });
      throw companiesError;
    }
    
    debug.checks.push({ 
      name: 'fetchAdminCompanyData', 
      result: companies?.length || 0,
      message: `Found ${companies?.length || 0} companies` 
    });
    console.log(`Found ${companies?.length || 0} companies for admin`);
    
    return companies || [];
  } catch (error: any) {
    debug.checks.push({ 
      name: 'fetchAdminCompanyData', 
      result: error.message,
      message: `Exception: ${error.message}` 
    });
    return [];
  }
}

/**
 * Fetch company users data for administrators
 */
export async function fetchAdminCompanyUsers(debug: CustomerDebugInfo): Promise<any[]> {
  try {
    debug.checks.push({ 
      name: 'fetchAdminCompanyUsers', 
      result: true,
      message: 'Starting admin company users fetch' 
    });
    
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
        is_manager_kpi_enabled,
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
      debug.checks.push({ 
        name: 'fetchAdminCompanyUsers', 
        result: companyUsersError.message,
        message: `Error: ${companyUsersError.message}` 
      });
      throw companyUsersError;
    }
    
    debug.checks.push({ 
      name: 'fetchAdminCompanyUsers', 
      result: companyUsers?.length || 0,
      message: `Found ${companyUsers?.length || 0} company-user associations` 
    });
    console.log(`Found ${companyUsers?.length || 0} company-user associations for admin`);
    
    return companyUsers || [];
  } catch (error: any) {
    debug.checks.push({ 
      name: 'fetchAdminCompanyUsers', 
      result: error.message,
      message: `Exception: ${error.message}` 
    });
    return [];
  }
}

/**
 * Repair admin data
 */
export async function repairAdminData(userId: string, userEmail: string | undefined, debug: CustomerDebugInfo): Promise<boolean> {
  try {
    debug.checks.push({ 
      name: 'repairAdminData', 
      result: true,
      message: 'Starting admin data repair' 
    });
    
    // First try repairing company users
    const repairResult = await repairCompanyUsers();
    
    if (repairResult.status === 'error') {
      debug.checks.push({ 
        name: 'repairAdminData', 
        result: repairResult.error,
        message: `Repair failed: ${repairResult.error}` 
      });
      return false;
    }
    
    debug.checks.push({ 
      name: 'repairAdminData', 
      result: `Success: ${repairResult.repaired} users repaired`,
      message: `Successfully repaired ${repairResult.repaired} users` 
    });
    
    return true;
  } catch (error: any) {
    debug.checks.push({ 
      name: 'repairAdminData', 
      result: error.message,
      message: `Exception: ${error.message}` 
    });
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
