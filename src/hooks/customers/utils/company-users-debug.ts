
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
        .select(`
          *,
          companies:company_id (
            id,
            name
          )
        `)
        .eq('user_id', debug.userId);
        
      if (userCompanyError) {
        console.error('Error checking user company association:', userCompanyError);
        debug.companyUsersDiagnostics = {
          status: 'error',
          error: userCompanyError.message
        };
      } else {
        const userCompanyCount = userCompanyData?.length || 0;
        console.log(`User ${debug.userId} has ${userCompanyCount} company associations:`, userCompanyData);
        
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
      .select(`
        *,
        companies:company_id (
          id,
          name
        )
      `)
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
      console.log(`User ${userId} already has ${existingData.length} company associations`, existingData);
      
      // Find best company match based on email domain if email provided
      let bestCompanyId = existingData[0].company_id;
      
      if (userEmail && userEmail.includes('@')) {
        const emailDomain = userEmail.split('@')[1].toLowerCase();
        const domainPrefix = emailDomain.split('.')[0];
        
        console.log(`Looking for best company match for domain: ${emailDomain}, prefix: ${domainPrefix}`);
        
        // Try to find matching company by name/domain
        for (const cu of existingData) {
          const companyName = cu.companies?.name?.toLowerCase() || '';
          if (companyName === domainPrefix || 
              companyName.includes(domainPrefix) || 
              domainPrefix.includes(companyName)) {
            console.log(`Found domain match: ${companyName} matches ${domainPrefix}`);
            bestCompanyId = cu.company_id;
            break;
          }
        }
      }
      
      // Update all company associations as associated_companies
      const associatedCompanies = existingData.map(cu => ({
        id: cu.id,
        company_id: cu.company_id,
        company_name: cu.companies?.name || '',
        role: cu.role,
        is_primary: cu.company_id === bestCompanyId
      }));
      
      debug.companyUsersRepair = {
        status: 'updated',
        message: `User has ${existingData.length} company associations, primary is company_id ${bestCompanyId}`,
        associatedCompanies
      };
    } else {
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
          message: `Created association with company ${company.name} (${company.id})`,
          associatedCompanies: [{
            company_id: company.id,
            company_name: company.name,
            role: 'admin',
            is_primary: true
          }]
        };
      }
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

/**
 * Find best company match for a user based on their email domain
 */
export function findBestCompanyMatch(
  email: string | undefined,
  companies: Array<{ id: string, name: string }> | null | undefined
): string | undefined {
  if (!email || !email.includes('@') || !companies || companies.length === 0) {
    return companies?.[0]?.id;
  }
  
  const emailDomain = email.split('@')[1].toLowerCase();
  const domainPrefix = emailDomain.split('.')[0];
  
  console.log(`Finding best company match for domain: ${emailDomain}, prefix: ${domainPrefix}`);
  
  // Try to find exact match first
  for (const company of companies) {
    const companyName = company.name.toLowerCase();
    if (companyName === domainPrefix) {
      console.log(`Found exact domain match: ${companyName} equals ${domainPrefix}`);
      return company.id;
    }
  }
  
  // Try fuzzy match
  for (const company of companies) {
    const companyName = company.name.toLowerCase();
    if (companyName.includes(domainPrefix) || domainPrefix.includes(companyName)) {
      console.log(`Found fuzzy domain match: ${companyName} matches ${domainPrefix}`);
      return company.id;
    }
  }
  
  // Default to first company
  return companies[0]?.id;
}
