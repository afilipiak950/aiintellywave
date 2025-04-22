
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
        console.log('Fetching all users from profiles table...');

        // Fetch all users from profiles table without filtering
        const { data: profilesData, error: profilesError, count } = await supabase
          .from('profiles')
          .select('*, auth.users(email)', { count: 'exact' });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log(`Found ${profilesData?.length || 0} profiles`);
        
        // Transform profiles data to expected format
        const formattedCustomers = profilesData?.map(profile => {
          // Extract email from the joined auth.users data or use an empty string
          const userEmail = profile.auth?.users?.email || '';
          
          return {
            id: profile.id,
            user_id: profile.id, // For compatibility
            email: userEmail,
            full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            company_id: null, // Will be populated later if needed
            company_name: '',
            company_role: '',
            role: '',
            is_admin: false,
            avatar_url: profile.avatar_url || '',
            phone: profile.phone || '',
            position: profile.position || '',
            is_active: profile.is_active !== false, // Default to true if undefined
            contact_email: userEmail,
            contact_phone: profile.phone || '',
            city: '',
            country: '',
            tags: [],
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User'
          };
        }) || [];

        // Optionally, fetch role information from user_roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (!rolesError && rolesData) {
          // Create a map of user_id to role
          const roleMap = new Map();
          rolesData.forEach(roleEntry => {
            roleMap.set(roleEntry.user_id, roleEntry.role);
          });
          
          // Update formatted customers with role information
          formattedCustomers.forEach(customer => {
            if (roleMap.has(customer.id)) {
              customer.role = roleMap.get(customer.id);
              customer.company_role = roleMap.get(customer.id);
              customer.is_admin = roleMap.get(customer.id) === 'admin';
            }
          });
        }

        return formattedCustomers as CustomerData[];
      } catch (error: any) {
        console.error('Error in fetchCustomersData:', error);
        throw error;
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
    debugInfo: {
      totalUsersCount: customers?.length || 0,
      filteredUsersCount: filteredCustomers?.length || 0,
      source: 'profiles'
    }
  };
}
