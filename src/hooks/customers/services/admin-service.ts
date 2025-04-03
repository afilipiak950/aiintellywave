import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';
import { diagnoseCompanyUsers, repairCompanyUsers } from '../utils/company-users-debug';

// Re-export key functions to avoid errors
export async function fetchAdminCompanyData(debug: CustomerDebugInfo) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
      
    if (error) throw error;
    
    debug.companiesCount = data?.length || 0;
    console.log('Companies data received:', debug.companiesCount);
    return data || [];
  } catch (error) {
    console.error('Error fetching admin company data:', error);
    throw error;
  }
}

export async function fetchAdminCompanyUsers(debug: CustomerDebugInfo) {
  try {
    const { data, error } = await supabase
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
      `);
      
    if (error) throw error;
    
    debug.companyUsersCount = data?.length || 0;
    console.log('Company users data received:', debug.companyUsersCount);
    return data || [];
  } catch (error) {
    console.error('Error fetching admin company users:', error);
    throw error;
  }
}

export async function repairAdminData(userId: string, userEmail: string, debug: CustomerDebugInfo): Promise<boolean> {
  try {
    debug = await repairCompanyUsers(userId, userEmail, debug);
    return debug.companyUsersRepair?.status === 'success' || debug.companyUsersRepair?.status === 'exists';
  } catch (error) {
    console.error('Error repairing admin data:', error);
    return false;
  }
}
