
import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';

/**
 * Diagnose issues with company_users data
 */
export async function diagnoseCompanyUsers(debug: CustomerDebugInfo) {
  try {
    console.log('Running company_users diagnostics...');
    
    // Check if any company_users exist
    const { data: companyUsers, error: companyUsersError } = await supabase
      .from('company_users')
      .select('id')
      .limit(1);
      
    if (companyUsersError) {
      debug.companyUsersDiagnostics = {
        error: companyUsersError.message,
        status: 'error'
      };
      return debug;
    }
    
    // Try to count all company_users (using count with exact to avoid RLS issues)
    const { count: totalCount, error: countError } = await supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      debug.companyUsersDiagnostics = {
        error: countError.message,
        status: 'error',
        queryAttempted: 'count'
      };
      return debug;
    }
    
    // Try using the RPC function to check company_users for current admin
    const { data: userCompanyData, error: checkError } = await supabase.rpc(
      'check_company_users_population',
      { user_id: debug.userId }
    );
    
    debug.companyUsersDiagnostics = {
      status: 'completed',
      totalCount: totalCount || 0,
      userCompaniesFound: userCompanyData ? userCompanyData.length > 0 : false,
      userCompanyData: userCompanyData || []
    };
    
    return debug;
  } catch (error) {
    console.error('Error in diagnoseCompanyUsers:', error);
    debug.companyUsersDiagnostics = {
      error: error.message,
      status: 'exception'
    };
    return debug;
  }
}

/**
 * Repair missing company_users entries
 */
export async function repairCompanyUsers(userId: string, userEmail: string, debug: CustomerDebugInfo) {
  debug.companyUsersRepair = { started: true };
  
  try {
    // First check if we actually need to repair (user might already be in company_users)
    const { data: existingEntry, error: checkError } = await supabase
      .from('company_users')
      .select('id, company_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (!checkError && existingEntry) {
      debug.companyUsersRepair = { 
        status: 'exists', 
        message: 'User already has a company_users entry',
        existing: existingEntry
      };
      return debug;
    }
    
    // Get a valid company to associate with
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .order('created_at', { ascending: true })
      .limit(1);
      
    if (companiesError || !companies || companies.length === 0) {
      debug.companyUsersRepair = {
        status: 'error',
        error: companiesError ? companiesError.message : 'No companies found'
      };
      return debug;
    }
    
    const companyId = companies[0].id;
    
    // Insert into company_users
    const { data: inserted, error: insertError } = await supabase
      .from('company_users')
      .insert({
        user_id: userId,
        company_id: companyId,
        email: userEmail,
        role: 'admin',
        is_admin: true,
        full_name: 'Admin User'
      })
      .select()
      .single();
      
    if (insertError) {
      // Try an RPC function to bypass RLS (could be created if needed)
      debug.companyUsersRepair = {
        status: 'error',
        error: insertError.message,
        attempted: 'direct_insert'
      };
      return debug;
    }
    
    debug.companyUsersRepair = {
      status: 'success',
      message: `Successfully created company_users entry for ${userEmail} in company ${companies[0].name}`,
      inserted
    };
    
    return debug;
  } catch (error) {
    console.error('Error in repairCompanyUsers:', error);
    debug.companyUsersRepair = {
      status: 'exception',
      error: error.message
    };
    return debug;
  }
}
