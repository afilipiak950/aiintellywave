
import { useState, useEffect } from 'react';
import { fetchCustomerData } from '@/services/customerDataService';
import { filterCustomersBySearchTerm } from '@/utils/customerUtils';
import { Customer } from '@/types/customer';

export { Customer };

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { customers: fetchedCustomers, error } = await fetchCustomerData();
      
      if (error) {
        setErrorMsg(error);
      } else {
        setCustomers(fetchedCustomers);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Filter customers by search term
  const filteredCustomers = filterCustomersBySearchTerm(customers, searchTerm);
    
  return {
    customers: filteredCustomers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    fetchCustomers
  };
}
