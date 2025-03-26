
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

      // Direct query for user data
      try {
        // Get company_users first
        const { data: companyUsersData, error: companyUsersError } = await supabase
          .from('company_users')
          .select('user_id')
          .eq('company_id', user.companyId);

        if (companyUsersError) {
          console.warn('Error fetching company users:', companyUsersError);
        } else if (companyUsersData && companyUsersData.length > 0) {
          // Now get emails for these users if possible
          const userIds = companyUsersData.map(u => u.user_id);
          
          try {
            // Try to get user emails from auth admin API (requires admin rights)
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            
            if (authUsers && authUsers.users) {
              const emailMap: Record<string, string> = {};
              authUsers.users.forEach((user: any) => {
                if (user.id && user.email) {
                  emailMap[user.id] = user.email;
                }
              });
              
              // Add user data to the customer
              customerData.users = companyUsersData.map(user => ({
                id: user.user_id,
                email: emailMap[user.user_id] || user.user_id, // Fallback to ID if email not found
              }));
            }
          } catch (emailError) {
            console.warn('Could not fetch user emails:', emailError);
            // Add users without emails as fallback
            customerData.users = companyUsersData.map(user => ({
              id: user.user_id,
              email: user.user_id, // Just use the ID since we can't get the email
            }));
          }
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
