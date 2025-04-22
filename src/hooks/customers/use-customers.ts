import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/services/types/customerTypes';

type CustomerData = UserData;

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching all users from profiles table...');

        // Fetch all profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log(`Found ${profilesData?.length || 0} profiles`);
        
        // Fetch roles from user_roles table
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          // Don't throw here, continue with what we have
        }
        
        // Create a map of user_id to role
        const roleMap = new Map();
        if (rolesData) {
          rolesData.forEach(role => {
            roleMap.set(role.user_id, role.role);
          });
        }
        
        // Transform profiles data to expected format
        const formattedCustomers = profilesData?.map(profile => {
          // Get role from the map or use empty string
          const userRole = roleMap.get(profile.id) || '';
          
          return {
            id: profile.id,
            user_id: profile.id, // For compatibility
            full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            company_id: null, // Will be populated later if needed
            company_name: '',
            company_role: '',
            role: userRole,
            is_admin: userRole === 'admin',
            avatar_url: profile.avatar_url || '',
            phone: profile.phone || '',
            position: profile.position || '',
            is_active: profile.is_active !== false, // Default to true if undefined
            contact_email: '', // Email from auth.users is not accessible here
            contact_phone: profile.phone || '',
            city: '',
            country: '',
            tags: [],
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unnamed User'
          };
        }) || [];

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

  return {
    customers: filteredCustomers || [],
    isLoading,
    error,
    loading: isLoading,
    errorMsg: error ? error.message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    fetchCustomers: refetch,
    debugInfo: {
      totalUsersCount: customers?.length || 0,
      filteredUsersCount: filteredCustomers?.length || 0,
      source: 'profiles',
      companyUsersCount: 0,
      companyUsersDiagnostics: {
        status: 'info',
        totalCount: 0,
        data: []
      },
      companyUsersRepair: {
        status: 'info',
        message: 'No repair needed'
      }
    }
  };
}
