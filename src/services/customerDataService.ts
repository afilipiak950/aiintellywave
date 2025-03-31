
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { formatUserDataToCustomer } from '@/utils/customerUtils';
import { AuthUser } from './types/customerTypes';

export const fetchCustomerData = async (): Promise<{
  customers: Customer[];
  error: string | null;
}> => {
  try {
    console.log('Fetching customer data...');
    
    // First, try to get all users from auth - this requires admin privileges
    const { data: authUsersData, error: authError } = await supabase.functions.invoke("list-users", {});
    
    let authUsers: any[] = [];
    if (authError) {
      console.error('Error fetching auth users:', authError);
      // Continue with the rest of the function, we'll use company_users data
    } else {
      authUsers = authUsersData?.users || [];
      console.log('Fetched auth users:', authUsers.length);
    }
    
    // Query company_users with joined company data
    const { data: companyUsersData, error: companyUsersError } = await supabase
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
        last_sign_in_at,
        created_at_auth,
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
      console.error('Error fetching company users data:', companyUsersError);
      throw companyUsersError;
    }
    
    // Step 2: Fetch profiles data separately for any additional profile info
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles data:', profilesError);
      throw profilesError;
    }
    
    // Create maps for easy lookups
    const profilesMap: Record<string, any> = {};
    profilesData.forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    const companyUsersMap: Record<string, any> = {};
    companyUsersData.forEach(companyUser => {
      companyUsersMap[companyUser.user_id] = companyUser;
    });
    
    // Process all users from auth and company_users
    const formattedCustomers: Customer[] = [];
    
    // Add users from company_users first
    companyUsersData.forEach(companyUser => {
      const profile = profilesMap[companyUser.user_id] || {};
      const company = companyUser.companies || {
        id: '',
        name: '',
        city: '',
        country: '',
        contact_email: '',
        contact_phone: ''
      };
      
      // Prefer email from company_users or fall back to company contact email
      const email = companyUser.email || company.contact_email || '';
      
      // Prefer full_name from company_users or fall back to constructed name
      let fullName = companyUser.full_name || '';
      if (!fullName && (companyUser.first_name || companyUser.last_name)) {
        fullName = `${companyUser.first_name || ''} ${companyUser.last_name || ''}`.trim();
      }
      
      if (!fullName && (profile.first_name || profile.last_name)) {
        fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
      
      if (!fullName) {
        fullName = email || 'Unnamed User';
      }
      
      const customerData = {
        id: companyUser.user_id,
        user_id: companyUser.user_id,
        email: email,
        first_name: companyUser.first_name || profile.first_name || '',
        last_name: companyUser.last_name || profile.last_name || '',
        full_name: fullName,
        phone: profile.phone || '',
        is_active: profile.is_active !== false,
        avatar_url: companyUser.avatar_url || profile.avatar_url,
        position: profile.position || '',
        company_id: company.id || companyUser.company_id,
        company_name: company.name || '',
        company_role: companyUser.role || '',
        is_admin: companyUser.is_admin || false,
        city: company.city || '',
        country: company.country || '',
        contact_email: company.contact_email || email || '',
        contact_phone: company.contact_phone || ''
      };
      
      formattedCustomers.push(formatUserDataToCustomer(customerData));
    });
    
    // Add any auth users not already in the list
    if (authUsers.length > 0) {
      authUsers.forEach((authUser: any) => {
        // Skip if this user is already in our list
        if (formattedCustomers.some(customer => customer.id === authUser.id)) {
          return;
        }
        
        const profile = profilesMap[authUser.id] || {};
        const companyUser = companyUsersMap[authUser.id] || {};
        
        // Create name from various sources
        let fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || '';
        if (!fullName && (authUser.user_metadata?.first_name || authUser.user_metadata?.last_name)) {
          fullName = `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim();
        }
        
        if (!fullName && (profile.first_name || profile.last_name)) {
          fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        }
        
        if (!fullName) {
          fullName = authUser.email || 'Unnamed User';
        }
        
        const customerData = {
          id: authUser.id,
          user_id: authUser.id,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || profile.first_name || '',
          last_name: authUser.user_metadata?.last_name || profile.last_name || '',
          full_name: fullName,
          phone: profile.phone || '',
          is_active: profile.is_active !== false,
          avatar_url: authUser.user_metadata?.avatar_url || profile.avatar_url,
          position: profile.position || '',
          company_id: '',
          company_name: '',
          company_role: authUser.user_metadata?.role || companyUser.role || '',
          is_admin: companyUser.is_admin || false,
          city: '',
          country: '',
          contact_email: authUser.email || '',
          contact_phone: ''
        };
        
        formattedCustomers.push(formatUserDataToCustomer(customerData));
      });
    }
    
    console.log('Formatted customers:', formattedCustomers.length);
    return { customers: formattedCustomers, error: null };
  } catch (error: any) {
    console.error('Error in fetchCustomerData:', error);
    
    return { 
      customers: [], 
      error: error.message || 'Failed to load customers. Please try again.' 
    };
  }
};
