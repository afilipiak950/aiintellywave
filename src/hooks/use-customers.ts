
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Customer } from '@/types/customer';
import { fetchCustomerData } from '@/services/customerDataService';
import { filterCustomersBySearchTerm } from '@/utils/customerUtils';

export type { Customer };

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
      
      console.log('Using customerDataService to fetch customers...');
      const { customers: fetchedCustomers, error } = await fetchCustomerData();
      
      if (error) {
        setErrorMsg(error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive"
        });
      } else {
        setCustomers(fetchedCustomers);
      }
    } catch (error: any) {
      console.error('Error in useCustomers hook:', error);
      const errorMsg = error.message || 'Failed to load customers. Please try again.';
      
      setErrorMsg(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
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
