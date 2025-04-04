
import { supabase } from '@/integrations/supabase/client';

/**
 * Function to diagnose issues with company_users table
 */
export const diagnoseCompanyUsers = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('check_company_users_population', {
      user_id: userId
    });
    
    if (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
    
    return {
      status: 'success',
      totalCount: Array.isArray(data) ? data.length : 0,
      data
    };
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Unknown error checking company users'
    };
  }
};

/**
 * Function to repair company users associations
 */
export const repairCompanyUsers = async () => {
  try {
    // Call the edge function to repair company associations
    const { data, error } = await supabase.functions.invoke('repair-company-associations', {
      method: 'POST',
    });
    
    if (error) {
      console.error('Error repairing company associations:', error);
      return {
        status: 'error',
        error: error.message,
      };
    }
    
    // Handle the response
    if (data && typeof data === 'object') {
      const responseData = data as any;
      return {
        status: 'success',
        message: 'Updated company associations',
        companies: responseData.companies || [],
        associations: responseData.associations || [],
        repairs: responseData.repairs || []
      };
    }
    
    return {
      status: 'success',
      message: 'Repair completed but no detailed response',
      companies: [],
      associations: [],
      repairs: []
    };
  } catch (error: any) {
    console.error('Error repairing company users:', error);
    return {
      status: 'error',
      error: error.message || 'Unknown error repairing company users'
    };
  }
};

/**
 * Helper function to find the best company match for an email
 */
export const findBestCompanyMatch = (email: string | undefined, companies: Array<any>) => {
  if (!email || !email.includes('@')) return null;
  
  const domain = email.split('@')[1].toLowerCase();
  const domainPrefix = domain.split('.')[0];
  
  // First try exact match
  for (const company of companies) {
    const companyName = (company.name || '').toLowerCase();
    if (companyName === domain || companyName === domainPrefix) {
      return company.id;
    }
  }
  
  // Then try fuzzy match
  for (const company of companies) {
    const companyName = (company.name || '').toLowerCase();
    if (companyName.includes(domainPrefix) || domainPrefix.includes(companyName)) {
      return company.id;
    }
  }
  
  return null;
};
