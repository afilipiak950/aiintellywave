
import { supabase } from '@/integrations/supabase/client';

export interface CompanyUserRepairResult {
  status: 'success' | 'error';
  repaired: number;
  error?: string;
  message?: string;
  associatedCompanies?: Array<{
    company_id: string;
    company_name?: string;
    role?: string;
    is_primary?: boolean;
  }>;
}

export interface CompanyUserDiagnosticResult {
  status: string;
  totalCount?: number;
  data?: any[];
  error?: string;
}

/**
 * Utility function to diagnose company user associations
 */
export const diagnoseCompanyUsers = async (userId?: string): Promise<CompanyUserDiagnosticResult> => {
  try {
    // If userId is provided, check for that specific user
    if (userId) {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          is_admin,
          email,
          full_name,
          is_manager_kpi_enabled,
          companies:company_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error diagnosing company users for specific user:', error);
        return {
          status: 'error',
          error: error.message
        };
      }
      
      return {
        status: 'success',
        totalCount: data?.length || 0,
        data: data || []
      };
    }
    
    // Otherwise, check overall health
    const { count, error } = await supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error counting company users:', error);
      return {
        status: 'error',
        error: error.message
      };
    }
    
    return {
      status: 'success',
      totalCount: count || 0
    };
  } catch (error: any) {
    console.error('Exception diagnosing company users:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Utility function to repair company user associations when they're broken
 */
export const repairCompanyUsers = async (): Promise<CompanyUserRepairResult> => {
  try {
    // Call the repair function on the database
    const { data, error } = await supabase.rpc('repair_user_company_associations');
    
    if (error) {
      console.error('Error repairing company users:', error);
      return {
        status: 'error',
        repaired: 0,
        error: error.message
      };
    }
    
    // Transform the data to match the expected type
    // The RPC function returns user_id, email, old_company_id, new_company_id
    // We need to transform it to company_id, company_name, etc.
    const associatedCompanies = data?.map((item: any) => ({
      company_id: item.new_company_id,
      company_name: item.company_name || 'Company', // This might be undefined if not returned by the RPC
      role: item.role, // This might be undefined if not returned by the RPC
      is_primary: true // Assuming repaired associations are primary
    })) || [];
    
    return {
      status: 'success',
      repaired: data?.length || 0,
      message: `Successfully repaired ${data?.length || 0} company-user associations`,
      associatedCompanies
    };
  } catch (error: any) {
    console.error('Exception repairing company users:', error);
    return {
      status: 'error',
      repaired: 0,
      error: error.message
    };
  }
};
