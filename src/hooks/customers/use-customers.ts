
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { useFetchCustomers } from './use-fetch-customers';
import { filterCustomersBySearchTerm } from './utils/search-utils';
import { UseCustomersResult } from './types';

export const useCustomers = (): UseCustomersResult => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { 
    customers, 
    loading, 
    errorMsg, 
    fetchCustomers: fetchCustomersData,
    debugInfo
  } = useFetchCustomers();
  
  const fetchCustomers = async () => {
    if (user) {
      await fetchCustomersData(user.id, user.email);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);
  
  // Filter customers by search term
  const filteredCustomers = filterCustomersBySearchTerm(customers, searchTerm);
    
  return {
    customers: filteredCustomers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
    debugInfo
  };
};

// Export the types from this file
export * from './types';
