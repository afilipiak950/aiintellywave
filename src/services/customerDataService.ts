
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { formatUserDataToCustomer } from '@/utils/customerUtils';

export const fetchCustomerData = async (): Promise<{
  customers: Customer[];
  error: string | null;
}> => {
  try {
    console.log('Fetching customer data...');
    
    // Step 1: Fetch company_users data with companies
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
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
    
    // Step 2: Fetch profiles data separately
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error fetching profiles data:', profilesError);
      throw profilesError;
    }
    
    // Create a map of profiles by id for easy lookup
    const profilesMap: Record<string, any> = {};
    profilesData.forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    // Step 3: Fetch auth users data to get emails
    let authUsers: any[] = [];
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.warn('Error fetching auth users:', error);
      } else if (data && data.users) {
        authUsers = data.users;
      }
    } catch (err) {
      console.warn('Could not fetch auth users:', err);
    }
    
    // Create a map of emails by user id
    const emailMap: Record<string, string> = {};
    authUsers.forEach(user => {
      if (user.id && user.email) {
        emailMap[user.id] = user.email;
      }
    });
    
    // Step 4: Format data into Customer objects
    const formattedCustomers: Customer[] = companyUsersData.map(companyUser => {
      const profile = profilesMap[companyUser.user_id] || {};
      const company = companyUser.companies || {};
      const email = emailMap[companyUser.user_id] || '';
      
      let fullName = 'Unnamed User';
      if (profile) {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        if (firstName || lastName) {
          fullName = `${firstName} ${lastName}`.trim();
        }
      }
      
      const customerData = {
        id: companyUser.user_id,
        user_id: companyUser.user_id,
        email: email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: fullName,
        phone: profile.phone || '',
        is_active: profile.is_active !== false,
        avatar_url: profile.avatar_url,
        position: profile.position || '',
        company_id: company.id || companyUser.company_id,
        company_name: company.name || '',
        company_role: companyUser.role || '',
        is_admin: companyUser.is_admin || false,
        city: company.city || '',
        country: company.country || '',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || ''
      };
      
      return formatUserDataToCustomer(customerData);
    });
    
    console.log('Formatted customers:', formattedCustomers);
    return { customers: formattedCustomers, error: null };
  } catch (error: any) {
    console.error('Error in fetchCustomerData:', error);
    
    return { 
      customers: [], 
      error: error.message || 'Failed to load customers. Please try again.' 
    };
  }
};
