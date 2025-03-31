
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Customer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

export function useManagerCustomer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCustomer();
  }, []);
  
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching manager customer data...');
      
      // Query company_users directly with company information
      // Using a simpler query to avoid RLS recursion issues
      const { data: companyUsersData, error: usersError } = await supabase
        .from('company_users')
        .select(`
          id,
          user_id,
          company_id,
          role,
          is_admin,
          email,
          full_name,
          first_name,
          last_name,
          avatar_url,
          contact_email:email,
          contact_phone
        `);
      
      if (usersError) {
        console.error('Error fetching company users:', usersError);
        throw usersError;
      }
      
      // Get company data separately
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, city, country');
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }
      
      // Create a map of companies by ID for easy lookup
      const companiesMap: Record<string, any> = {};
      if (companiesData) {
        companiesData.forEach(company => {
          companiesMap[company.id] = company;
        });
      }
      
      // Format the data for display
      const formattedCustomers = companyUsersData ? companyUsersData.map(user => {
        const company = companiesMap[user.company_id] || {};
        
        return {
          id: user.user_id,
          name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User',
          email: user.email || '',
          contact_email: user.email || '',
          contact_phone: user.contact_phone || '',
          role: user.role || 'customer',
          company_name: company.name || '',
          company: company.name || '',
          city: company.city || '',
          country: company.country || '',
          status: 'active', // Default status
          users: [], // No users information for now
        };
      }) : [];
      
      console.log('Manager customers data processed:', formattedCustomers.length);
      setCustomers(formattedCustomers);
      
    } catch (error: any) {
      console.error('Error in useManagerCustomer hook:', error);
      
      let errorMessage = 'Failed to load customers data. Please try again.';
      
      // Handle specific error types with more informative messages
      if (error.code === '42P17') {
        errorMessage = 'Database policy recursion detected. Our team is working on resolving this issue.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      setErrorMsg(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
    } finally {
      setLoading(false);
    }
  };
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    const name = customer.name ? customer.name.toLowerCase() : '';
    const email = customer.email ? customer.email.toLowerCase() : '';
    const company = customer.company_name ? customer.company_name.toLowerCase() : '';
    
    return name.includes(term) || 
           email.includes(term) || 
           company.includes(term);
  });
  
  return {
    customers: filteredCustomers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    fetchCustomer
  };
}
