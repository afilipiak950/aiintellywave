
import { useState } from 'react';
import { useAuth } from '@/context/auth';
import { useFetchCustomers } from './use-fetch-customers';
import { filterCustomersBySearchTerm } from './utils/search-utils';
import { UseCustomersResult, Customer, FetchCustomersResult } from './types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useCustomers = (): UseCustomersResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { fetchCustomers: fetchCustomersData, debugInfo } = useFetchCustomers();
  
  // Fetch and cache customers data with React Query
  const { 
    data: customers = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customers', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const result = await fetchCustomersData(user.id, user.email);
      return result; // Return the full result, not accessing .customers
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
  });
  
  // Set up realtime subscription for customer updates
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('[useCustomers] Setting up realtime subscription for customers');
    
    // Subscribe to company_users changes for the current user
    const channel = supabase.channel('public:customers-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'company_users'
      }, () => {
        console.log('[useCustomers] Customer data changed, invalidating cache');
        queryClient.invalidateQueries({ queryKey: ['customers', user.id] });
      })
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('[useCustomers] Successfully subscribed to customer changes');
        }
      });
      
    return () => {
      console.log('[useCustomers] Cleaning up customer subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  // Filter customers by search term
  const customersArray = customers?.customers || [];
  const filteredCustomers = filterCustomersBySearchTerm(customersArray, searchTerm);
    
  // Create a wrapped refetch function that returns void
  const fetchCustomers = async () => {
    console.log('[useCustomers] Manual refetch triggered');
    await refetch();
  };

  return {
    customers: filteredCustomers,
    loading,
    errorMsg: error instanceof Error ? error.message : null,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
    debugInfo: customers?.debugInfo || debugInfo
  };
};

// Export the types from this file
export * from './types';
