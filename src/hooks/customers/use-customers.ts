
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomerData } from '@/services/types/customerTypes';

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
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
          // Ensure company data is properly typed with defaults
          const companyData = user.companies || {};
          
          return {
            id: user.id,
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            first_name: user.first_name,
            last_name: user.last_name,
            company_id: user.company_id,
            company_name: companyData?.name || '',
            company_role: user.role || '',
            role: user.role,
            is_admin: user.is_admin,
            avatar_url: user.avatar_url,
            phone: '',
            position: '',
            is_active: true,
            contact_email: companyData?.contact_email || user.email || '',
            contact_phone: companyData?.contact_phone || '',
            city: companyData?.city || '',
            country: companyData?.country || '',
            tags: Array.isArray(companyData?.tags) ? companyData?.tags : []
          };
        });

        return formattedUserData as CustomerData[];
      } catch (error: any) {
        console.error('Error in fetchUserData:', error);
        return [];
      }
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.company_name?.toLowerCase().includes(searchLower) ||
      customer.role?.toLowerCase().includes(searchLower)
    );
  });

  return {
    customers: filteredCustomers || [],
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    refetch
  };
}
