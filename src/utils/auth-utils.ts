import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the authenticated user from Supabase Auth
 * @returns The authenticated user or null if not authenticated
 */
export const getAuthUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting authenticated user:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception getting authenticated user:', error);
    return null;
  }
};

/**
 * Gets the company ID for the current authenticated user
 * @returns The company ID or null if not found
 */
export const getUserCompanyId = async () => {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      console.error('Cannot get company ID: User not authenticated');
      return null;
    }
    
    // First try to get company ID from company_users table
    const { data, error } = await supabase
      .from('company_users')
      .select('company_id, is_primary_company, companies:company_id(name)')
      .eq('user_id', user.id)
      .order('is_primary_company', { ascending: false }) // Try to get primary company first
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Error fetching from company_users:', error.message);
      
      // Try fallback to user metadata if company_users query fails
      if (user.user_metadata && user.user_metadata.company_id) {
        console.log('Using fallback company ID from user metadata:', user.user_metadata.company_id);
        return user.user_metadata.company_id;
      }
      
      // If still not found, try to auto-repair by creating an association
      try {
        console.log('Attempting to auto-repair missing company association');
        
        // First check if any companies exist
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('id, name')
          .limit(1);
          
        if (companiesError || !companies || companies.length === 0) {
          console.error('No companies available for auto-repair:', companiesError || 'No companies found');
          return null;
        }
        
        const defaultCompanyId = companies[0].id;
        
        // Create company_users association directly instead of using edge function
        const { data: newAssociation, error: insertError } = await supabase
          .from('company_users')
          .insert({
            user_id: user.id,
            company_id: defaultCompanyId,
            role: 'customer',
            email: user.email,
            is_primary_company: true
          })
          .select();
          
        if (insertError) {
          console.error('Auto-repair failed:', insertError);
          return null;
        }
        
        console.log('Auto-repair successful, using company ID:', defaultCompanyId);
        return defaultCompanyId;
      } catch (repairException) {
        console.error('Exception in auto-repair attempt:', repairException);
      }
      
      console.error('User has no company association');
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No company associations found for user');
      return null;
    }
    
    // Find primary company first
    const primaryCompany = data.find(assoc => assoc.is_primary_company);
    if (primaryCompany) {
      console.log('Using primary company:', primaryCompany.company_id);
      return primaryCompany.company_id;
    }
    
    // Otherwise use the first one
    console.log('Using first available company:', data[0].company_id);
    return data[0].company_id;
  } catch (error) {
    console.error('Exception getting user company ID:', error);
    return null;
  }
};

/**
 * Gets all the companies associated with the current user
 * @returns Array of company IDs or empty array if none found
 */
export const getUserCompanyIds = async () => {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      console.error('Cannot get company IDs: User not authenticated');
      return [];
    }
    
    const { data, error } = await supabase
      .from('company_users')
      .select('company_id, companies:company_id(id, name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting user company IDs:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('No company associations found for user');
      return [];
    }
    
    return data.map(row => row.company_id) || [];
  } catch (error) {
    console.error('Exception getting user company IDs:', error);
    return [];
  }
};

/**
 * Check if a company ID is valid and the current user has access to it
 * @param companyId The company ID to check
 * @returns True if the company ID is valid and accessible, false otherwise
 */
export const validateUserCompanyAccess = async (companyId: string | null) => {
  if (!companyId) return false;
  
  try {
    const companyIds = await getUserCompanyIds();
    return companyIds.includes(companyId);
  } catch (error) {
    console.error('Error validating company access:', error);
    return false;
  }
};

/**
 * Gets user role for the specified company
 * @param companyId Company ID to check role for
 * @returns The user's role or null if not found
 */
export const getUserRoleForCompany = async (companyId: string | null) => {
  if (!companyId) return null;
  
  try {
    const user = await getAuthUser();
    
    if (!user) {
      console.error('Cannot get user role: User not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('company_users')
      .select('role, is_admin')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single();
    
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return data?.role || null;
  } catch (error) {
    console.error('Exception getting user role:', error);
    return null;
  }
};
