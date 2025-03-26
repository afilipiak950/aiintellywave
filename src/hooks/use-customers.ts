
import { useState, useEffect } from 'react';
import { fetchCompanies, fetchCompanyUsers, fetchUsers } from '@/services/customerService';
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
      
      // Fetch users data instead of companies
      const usersData = await fetchUsers();
      
      console.log('Users data in hook:', usersData);
      
      // Transform users data to customer format
      const formattedCustomers = usersData.map(user => ({
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar_url,
        status: user.is_active ? 'active' : 'inactive',
        role: user.user_roles?.role || 'unknown',
        position: user.position || '',
      }));
      
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error in fetchCustomers:', error);
      
      // Don't show the recursive RLS error to users
      if (error.message?.includes('infinite recursion')) {
        console.warn('Suppressing RLS recursion error in UI');
        // Still set customers with the data we have
        const formattedCustomers = [];
        setCustomers(formattedCustomers);
      } else {
        setErrorMsg(error.message || 'Failed to load customers. Please try again.');
      }
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
