
import { useState } from 'react';
import { Customer, CustomerDebugInfo } from './types';
import { fetchCustomerData } from './services/fetch-service';

export const useFetchCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debugInfo, setDebugInfo] = useState<CustomerDebugInfo | undefined>();
  
  /**
   * Fetch customers data from backend
   */
  const fetchCustomers = async (userId: string, userEmail?: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { customers: fetchedCustomers, debugInfo: fetchDebugInfo } = 
        await fetchCustomerData({ userId, userEmail });
      
      setCustomers(fetchedCustomers);
      setDebugInfo(fetchDebugInfo);
      
    } catch (error: any) {
      console.error('Error in useCustomers hook:', error);
      setErrorMsg(error.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    customers,
    loading,
    errorMsg,
    fetchCustomers,
    setCustomers,
    debugInfo
  };
};
