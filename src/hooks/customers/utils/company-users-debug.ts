import { supabase } from '@/integrations/supabase/client';
import { CustomerDebugInfo } from '../types';

/**
 * Diagnose issues with company_users table
 */
export async function diagnoseCompanyUsers(debug: CustomerDebugInfo): Promise<CustomerDebugInfo> {
  try {
    console.log('Diagnosing company_users issues...');
    
    // Check if the table exists and has records
    const { count, error: countError } = await supabase
      .from('company_users')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error checking company_users table:', countError);
      debug.companyUsersDiagnostics = {
        status: 'error',
        error: countError.message
      };
      return debug;
    }
    
    console.log('Total company_users records:', count);
    
    // Check for user's record specifically
    if (debug.userId) {
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('company_users')
        .select('*')
        .eq('user_id', debug.userId);
        
      if (userCompanyError) {
        console.error('Error checking user company association:', userCompanyError);
        debug.companyUsersDiagnostics = {
          status: 'error',
          error: userCompanyError.message
        };
      } else {
        const userCompanyCount = userCompanyData?.length || 0;
        console.log(`User ${debug.userId} has ${userCompanyCount} company associations`);
        
        debug.companyUsersDiagnostics = {
          status: userCompanyCount > 0 ? 'exists' : 'missing',
          totalCount: userCompanyCount,
          data: userCompanyData
        };
      }
    }
    
    return debug;
  } catch (diagError: any) {
    console.error('Error in diagnoseCompanyUsers:', diagError);
    debug.companyUsersDiagnostics = {
      status: 'error',
      error: diagError.message
    };
    return debug;
  }
}

/**
 * Repair company_users issues for a specific user
 */
export async function repairCompanyUsers(
  userId: string, 
  userEmail?: string,
  debugInfo?: CustomerDebugInfo
): Promise<CustomerDebugInfo> {
  const debug = debugInfo || {
    userId,
    userEmail,
    timestamp: new Date().toISOString(),
    checks: []
  };
  
  try {
    console.log('Repairing company_users for user:', userId);
    
    // First check if user already has a company association
    const { data: existingData, error: checkError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing user-company associations:', checkError);
      debug.companyUsersRepair = {
        status: 'error',
        error: checkError.message
      };
      return debug;
    }
    
    if (existingData && existingData.length > 0) {
      console.log(`User ${userId} already has ${existingData.length} company associations`);
      
      // If multiple associations exist, make sure user has exactly one
      if (existingData.length > 1) {
        console.log('User has multiple company associations, consolidating...');
        
        // Find the best company to keep (prioritize manager role)
        const companyToKeep = existingData.find(cu => cu.role === 'manager') || 
                              existingData.find(cu => cu.is_manager_kpi_enabled) || 
                              existingData[0];
        
        // Delete all other associations
        for (const cu of existingData) {
          if (cu.company_id !== companyToKeep.company_id) {
            await supabase
              .from('company_users')
              .delete()
              .eq('user_id', userId)
              .eq('company_id', cu.company_id);
          }
        }
        
        debug.companyUsersRepair = {
          status: 'consolidated',
          message: `Consolidated ${existingData.length} company associations to keep company_id ${companyToKeep.company_id}`
        };
      } else {
        debug.companyUsersRepair = {
          status: 'exists',
          message: `User already has a company association with company_id ${existingData[0].company_id}`
        };
      }
      
      return debug;
    }
    
    // If no association exists, create one with first available company
    console.log('No company association found, creating one...');
    
    // Get first available company
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
      
    if (companiesError || !companies || companies.length === 0) {
      console.error('Error fetching companies or no companies available:', companiesError);
      debug.companyUsersRepair = {
        status: 'error',
        error: companiesError?.message || 'No companies available'
      };
      return debug;
    }
    
    const company = companies[0];
    
    // Create user-company association
    const { error: insertError } = await supabase
      .from('company_users')
      .insert({
        user_id: userId,
        company_id: company.id,
        role: 'admin',
        is_admin: true,
        email: userEmail,
        created_at: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Error creating company association:', insertError);
      debug.companyUsersRepair = {
        status: 'error',
        error: insertError.message
      };
    } else {
      console.log(`Created company association for user ${userId} with company ${company.id}`);
      debug.companyUsersRepair = {
        status: 'success',
        message: `Created association with company ${company.name} (${company.id})`
      };
    }
    
    return debug;
  } catch (repairError: any) {
    console.error('Error in repairCompanyUsers:', repairError);
    debug.companyUsersRepair = {
      status: 'error',
      error: repairError.message
    };
    return debug;
  }
}
