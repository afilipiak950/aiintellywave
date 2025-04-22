
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
        console.log('Fetching all users from auth.users/profiles tables...');
        
        // Invoke the get_all_users edge function
        const { data: { data: users, error: usersError } } = await supabase.functions.invoke('get_all_users');
        
        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw new Error(usersError);
        }

        console.log(`Found ${users?.length || 0} users`);
        return users as CustomerData[];
        
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
    errorMsg: error ? (error as Error).message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    fetchCustomers: refetch,
    debugInfo: {
      totalUsersCount: customers?.length || 0,
      filteredUsersCount: filteredCustomers?.length || 0,
      source: 'auth.users + profiles',
      companyUsersCount: 0,
      companyUsersDiagnostics: {
        status: 'info',
        totalCount: 0,
        data: []
      },
      companyUsersRepair: {
        status: 'info',
        message: 'Showing all users directly from auth.users'
      }
    }
  };
}
