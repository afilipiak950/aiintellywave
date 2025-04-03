
import { useState } from 'react';
import { Customer, CustomerDebugInfo, FetchCustomersResult } from './types';
import { fetchCustomerData } from './services/fetch-service';

export const useFetchCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debugInfo, setDebugInfo] = useState<CustomerDebugInfo | undefined>();
  
  /**
   * Fetch customers data from backend
   */
  const fetchCustomers = async (userId: string, userEmail?: string): Promise<FetchCustomersResult> => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const result = await fetchCustomerData({ userId, userEmail });
      
      setCustomers(result.customers);
      setDebugInfo(result.debugInfo);
      
      return result;
    } catch (error: any) {
      console.error('Error in useCustomers hook:', error);
      setErrorMsg(error.message || 'Failed to load customers');
      
      // Still return a properly formatted result on error
      return {
        customers: [],
        debugInfo: {
          userId,
          userEmail,
          timestamp: new Date().toISOString(),
          error: error.message,
          checks: []
        }
      };
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
