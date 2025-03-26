
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { useAuth } from '../context/AuthContext';

export interface ManagerCustomer {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  country: string;
  status: 'active' | 'inactive';
  users?: { id: string; email: string }[];
}

export function useManagerCustomer() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<ManagerCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomer();
  }, [user]);

  const fetchCustomer = async () => {
    if (!user?.companyId) {
      console.warn('No company ID found for user.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      console.log('Fetching manager customer data for company:', user.companyId);

      // Direct query approach for company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.companyId)
        .maybeSingle();

      if (companyError) {
        console.error('Error fetching company data:', companyError);
        throw companyError;
      }

      if (!companyData) {
        console.warn('No company data found');
        setCustomer(null);
        setLoading(false);
        return;
      }

      console.log('Company data received:', companyData);
      
      // Format the company as a customer
      const customerData: ManagerCustomer = {
        id: companyData.id,
        name: companyData.name,
        contact_email: companyData.contact_email || '',
        contact_phone: companyData.contact_phone || '',
        city: companyData.city || '',
        country: companyData.country || '',
        status: 'active', // Set default status as active
        users: [],
      };

      // Direct query for user data - now use the enhanced company_users with email
      try {
        // Get company_users with email and names directly from the table
        const { data: companyUsersData, error: companyUsersError } = await supabase
          .from('company_users')
          .select('user_id, email, full_name')
          .eq('company_id', user.companyId);

        if (companyUsersError) {
          console.warn('Error fetching company users:', companyUsersError);
        } else if (companyUsersData && companyUsersData.length > 0) {
          // Add user data to the customer
          customerData.users = companyUsersData.map(user => ({
            id: user.user_id,
            email: user.email || user.user_id, // Now we can use email directly from company_users
          }));
        }
      } catch (userError: any) {
        console.warn('Error fetching user data:', userError);
      }

      setCustomer(customerData);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      
      // Set a detailed error message based on the error type
      if (error.code) {
        setErrorMsg(`Database error (${error.code}): ${error.message}`);
      } else if (error.message) {
        setErrorMsg(`Error: ${error.message}`);
      } else {
        setErrorMsg('Failed to load customer data. Please try again.');
      }
      
      toast({
        title: "Error",
        description: errorMsg || "Failed to load customer data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter customer if searchTerm exists
  const filteredCustomer = customer ? 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.country.toLowerCase().includes(searchTerm.toLowerCase())) ? 
    [customer] : [] : [];

  return {
    customer: filteredCustomer[0],
    customers: filteredCustomer,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    fetchCustomer
  };
}
