
import { useState, useEffect } from 'react';
import { fetchCompanies, fetchCompanyUsers } from '@/services/customerService';
import { transformCompaniesToCustomers, filterCustomersBySearchTerm } from '@/utils/customerTransform';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  projects?: number;
  avatar?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  users?: any[]; // Define the type for users array
}

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
      
      // Fetch companies data
      const companiesData = await fetchCompanies();
      
      if (!companiesData) {
        setLoading(false);
        setErrorMsg('Failed to load customers data');
        return;
      }
      
      // Fetch user data
      const usersByCompany = await fetchCompanyUsers();
      
      // Transform data
      const formattedCustomers = transformCompaniesToCustomers(companiesData, usersByCompany);
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error in fetchCustomers:', error);
      setErrorMsg('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
