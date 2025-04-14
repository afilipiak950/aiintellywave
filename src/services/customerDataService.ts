
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { formatUserDataToCustomer } from '@/utils/customerUtils';
import { AuthUser } from './types/customerTypes';

export const fetchCustomerData = async (): Promise<{
  customers: UICustomer[];
  error: string | null;
}> => {
  try {
    console.log('Fetching customer data...');
    
    // First try to fetch from customers table
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*');
      
    if (customersError) {
      console.error('Error fetching customers data:', customersError);
      // Don't throw error here, fall back to company_users
    } else if (customersData && customersData.length > 0) {
      console.log(`Found ${customersData.length} records in customers table`);
      
      // Map customers table data to UICustomer format
      const formattedCustomers: UICustomer[] = customersData.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: '',
        status: 'active',
        company: customer.name,
        company_name: customer.name,
        company_id: customer.id,
        setup_fee: customer.setup_fee,
        price_per_appointment: customer.price_per_appointment,
        monthly_revenue: customer.monthly_revenue,
        monthly_flat_fee: customer.monthly_flat_fee,
        appointments_per_month: customer.appointments_per_month,
        conditions: customer.conditions,
        notes: customer.conditions,
        start_date: customer.start_date,
        end_date: customer.end_date
      }));
      
      console.log('Formatted customers from customers table:', formattedCustomers);
      return { customers: formattedCustomers, error: null };
    }
    
    // Fallback to company_users if customers table is empty or not available
    console.log('Falling back to company_users table...');
    
    // Query company_users directly with joined company data
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
    
    // Create a map of profiles by id for easy lookup
    const profilesMap: Record<string, any> = {};
    profilesData.forEach(profile => {
      profilesMap[profile.id] = profile;
    });
    
    // Format data into Customer objects
    const formattedCustomers: UICustomer[] = companyUsersData.map(companyUser => {
      const profile = profilesMap[companyUser.user_id] || {};
      
      // Ensure company is typed correctly with default values for required properties
      const company = companyUser.companies || {
        id: '',
        name: '',
        city: '',
        country: '',
        contact_email: '',
        contact_phone: ''
      };
      
      // Prefer email from company_users (synced from auth) or fall back to company contact email
      const email = companyUser.email || company.contact_email || '';
      
      // Prefer full_name from company_users (synced from auth) or fall back to constructed name
      let fullName = companyUser.full_name || '';
      if (!fullName && (companyUser.first_name || companyUser.last_name)) {
        fullName = `${companyUser.first_name || ''} ${companyUser.last_name || ''}`.trim();
      }
      
      if (!fullName && (profile.first_name || profile.last_name)) {
        fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      }
      
      if (!fullName) {
        fullName = 'Unnamed User';
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
      
      return formatUserDataToCustomer(customerData);
    });
    
    console.log('Formatted customers from company_users fallback:', formattedCustomers);
    return { customers: formattedCustomers, error: null };
  } catch (error: any) {
    console.error('Error in fetchCustomerData:', error);
    
    return { 
      customers: [], 
      error: error.message || 'Failed to load customers. Please try again.' 
    };
  }
};
