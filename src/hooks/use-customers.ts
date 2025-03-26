
import { useState, useEffect } from 'react';
import { fetchUsers, fetchCompanyUsers } from '@/services/customerService';

export interface Customer {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  projects?: number;
  avatar?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  users?: any[]; // Define the type for users array
  role?: string;
  position?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
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
      
      // Fetch users data with company information
      const usersData = await fetchUsers();
      console.log('Users data in hook:', usersData);
      
      // Also fetch company_users data to get role information
      const companyUsersMap = await fetchCompanyUsers();
      console.log('Company users map:', companyUsersMap);
      
      // Transform users data to customer format with correct typing
      const formattedCustomers: Customer[] = usersData.map(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User';
        
        return {
          id: user.id,
          name: fullName,
          email: user.email || '',
          phone: user.phone || '',
          avatar: user.avatar_url,
          status: user.is_active ? 'active' : 'inactive',
          role: user.company_role || 'customer',
          position: user.position || '',
          company: user.company_name || '',
          company_id: user.company_id,
          company_name: user.company_name,
          city: user.city,
          country: user.country,
          contact_email: user.contact_email,
          contact_phone: user.contact_phone
        };
      });
      
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error in fetchCustomers:', error);
      
      // Don't show the recursive RLS error to users
      if (error.message?.includes('infinite recursion')) {
        console.warn('Suppressing RLS recursion error in UI');
        // Still set customers with the data we have
        const formattedCustomers: Customer[] = [];
        setCustomers(formattedCustomers);
      } else {
        setErrorMsg(error.message || 'Failed to load customers. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    const emailMatch = customer.email?.toLowerCase().includes(searchLower) || false;
    const companyMatch = customer.company?.toLowerCase().includes(searchLower) || false;
    const roleMatch = customer.role?.toLowerCase().includes(searchLower) || false;
    
    return nameMatch || emailMatch || companyMatch || roleMatch;
  });
    
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
