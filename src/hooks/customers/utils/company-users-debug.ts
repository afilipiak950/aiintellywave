
import { supabase } from '@/integrations/supabase/client';

export interface CompanyUserRepairResult {
  status: 'success' | 'error';
  repaired: number;
  error?: string;
}

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
    
    return {
      status: 'success',
      repaired: data?.length || 0
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
