
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/services/types/customerTypes';

// Define the CustomerData type locally if not exported from customerTypes
type CustomerData = UserData;

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching customers data...');

        // First attempt to fetch from customers table (primary source)
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*');

        if (customersError) {
          console.error('Error fetching from customers table:', customersError);
          // Fall back to company_users if customers table fetch fails
        } else if (customersData && customersData.length > 0) {
          console.log(`Found ${customersData.length} records in customers table`);
          
          // Map customers table data to expected format
          const formattedCustomers = customersData.map(customer => ({
            id: customer.id,
            user_id: customer.id, // For compatibility
            email: '',  // Customers table might not have email
            full_name: customer.name,
            first_name: '',
            last_name: '',
            company_id: customer.id,
            company_name: customer.name,
            company_role: '',
            role: '',
            is_admin: false,
            avatar_url: '',
            phone: '',
            position: '',
            is_active: true,
            contact_email: '',
            contact_phone: '',
            city: '',
            country: '',
            tags: [],
            // Add these fields from customers table
            monthly_revenue: customer.monthly_revenue,
            price_per_appointment: customer.price_per_appointment,
            setup_fee: customer.setup_fee,
            monthly_flat_fee: customer.monthly_flat_fee,
            appointments_per_month: customer.appointments_per_month,
            conditions: customer.conditions,
            start_date: customer.start_date,
            end_date: customer.end_date
          }));

          return formattedCustomers as CustomerData[];
        }

        // Fallback to company_users for backwards compatibility
        console.log('Falling back to company_users table...');
        const { data: userData, error } = await supabase
          .from('company_users')
          .select(`
            id,
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
              city,
              country,
              contact_email,
              contact_phone,
              tags
            )
          `);

        if (error) {
          console.error('Error fetching user data:', error);
          throw error;
        }

        // Format the user data
        const formattedUserData = userData.map(user => {
          // Ensure company data is properly typed with defaults and safe access
          const companyData = user.companies || {};
          
          return {
            id: user.id,
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            first_name: user.first_name,
            last_name: user.last_name,
            company_id: user.company_id,
            company_name: companyData && typeof companyData === 'object' ? companyData.name || '' : '',
            company_role: user.role || '',
            role: user.role,
            is_admin: user.is_admin,
            avatar_url: user.avatar_url,
            phone: '',
            position: '',
            is_active: true,
            contact_email: companyData && typeof companyData === 'object' ? companyData.contact_email || user.email || '' : '',
            contact_phone: companyData && typeof companyData === 'object' ? companyData.contact_phone || '' : '',
            city: companyData && typeof companyData === 'object' ? companyData.city || '' : '',
            country: companyData && typeof companyData === 'object' ? companyData.country || '' : '',
            tags: companyData && typeof companyData === 'object' && Array.isArray(companyData.tags) ? companyData.tags : []
          };
        });

        return formattedUserData as CustomerData[];
      } catch (error: any) {
        console.error('Error in fetchCustomersData:', error);
        return [];
      }
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.full_name?.toLowerCase().includes(searchLower)) ||
      (customer.email?.toLowerCase().includes(searchLower)) ||
      (customer.company_name?.toLowerCase().includes(searchLower)) ||
      (customer.role?.toLowerCase().includes(searchLower))
    );
  });

  // Create more compatible return object that matches what components expect
  return {
    customers: filteredCustomers || [],
    isLoading,
    error,
    loading: isLoading, // Add this for backward compatibility
    errorMsg: error ? error.message : null, // Add this for backward compatibility
    searchTerm,
    setSearchTerm,
    refetch,
    fetchCustomers: refetch, // Add alias for backward compatibility
    debugInfo: undefined // Add placeholder for backward compatibility
  };
}
