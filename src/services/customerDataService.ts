
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { formatUserDataToCustomer } from '@/utils/customerUtils';

export const fetchCustomerData = async (): Promise<{
  customers: UICustomer[];
  error: string | null;
}> => {
  try {
    console.log('Fetching customer data with comprehensive approach...');
    
    // First, fetch directly from auth.users to get all registered users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100 // Ensure we get all users
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      throw authError;
    }

    console.log(`Found ${authUsers?.users?.length || 0} auth users`);

    // Fetch company users to map additional information
    const { data: companyUsersData, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        company_id,
        email,
        full_name,
        first_name,
        last_name,
        role,
        avatar_url,
        companies:company_id (
          id,
          name,
          contact_email,
          contact_phone
        )
      `);

    if (companyUsersError) {
      console.error('Error fetching company users:', companyUsersError);
    }

    // Fetch profiles for additional user information
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }

    // Create maps for efficient lookup
    const companyUsersMap = new Map(
      companyUsersData?.map(user => [user.user_id, user]) || []
    );
    const profilesMap = new Map(
      profilesData?.map(profile => [profile.id, profile]) || []
    );

    // Transform auth users into customers
    const formattedCustomers: UICustomer[] = authUsers.users.map(user => {
      const companyUser = companyUsersMap.get(user.id);
      const profile = profilesMap.get(user.id);

      // Determine the best full name to use
      const fullName = user.user_metadata?.full_name || 
                   companyUser?.full_name || 
                   `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                   user.email?.split('@')[0] || 'Unnamed User';

      return {
        id: user.id,
        user_id: user.id,
        name: fullName, // Set the name property required by UICustomer
        email: user.email || companyUser?.email || '',
        first_name: user.user_metadata?.first_name || companyUser?.first_name || profile?.first_name || '',
        last_name: user.user_metadata?.last_name || companyUser?.last_name || profile?.last_name || '',
        full_name: fullName,
        company_id: companyUser?.company_id || '',
        company_name: companyUser?.companies?.name || '',
        company: companyUser?.companies?.name || '', // Also set company field for consistency
        avatar_url: user.user_metadata?.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '',
        avatar: user.user_metadata?.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '', // Set both avatar_url and avatar
        role: companyUser?.role || 'customer',
        status: 'active',
        phone: profile?.phone || '',
        contact_email: companyUser?.companies?.contact_email || user.email || '',
        contact_phone: companyUser?.companies?.contact_phone || ''
      };
    });

    console.log(`Transformed ${formattedCustomers.length} customers`);

    return { 
      customers: formattedCustomers, 
      error: null 
    };
  } catch (error: any) {
    console.error('Comprehensive error in fetchCustomerData:', error);
    return { 
      customers: [], 
      error: error.message || 'Failed to load customers comprehensively' 
    };
  }
};
