
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth';
import { Customer } from '@/hooks/customers/types';
import { filterCustomersBySearchTerm } from '@/hooks/customers/utils';

export interface ManagerCustomer {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive';
  city?: string;
  country?: string;
  users?: any[];
  avatar_url?: string;
  company_id?: string;
}

export function useManagerCustomer() {
  const [customers, setCustomers] = useState<ManagerCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching companies data for manager...');
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First get the user's company to determine which companies they can access
      const { data: userCompany, error: userCompanyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      if (userCompanyError) {
        console.error('Error fetching user company:', userCompanyError);
        throw new Error('Could not determine your company. Please try again.');
      }
      
      if (!userCompany?.company_id) {
        throw new Error('You are not associated with any company');
      }
      
      // Now fetch the company data directly using the company ID we know the user has access to
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id, name, contact_email, contact_phone, city, country, description')
        .eq('id', userCompany.company_id)
        .single();
      
      if (companyError) {
        console.error('Error fetching company:', companyError);
        throw companyError;
      }
      
      // Format as a customer object
      const formattedCustomer: ManagerCustomer = {
        id: company.id,
        name: company.name || 'Unnamed Company',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        status: 'active', 
        city: company.city || '',
        country: company.country || '',
        company_id: company.id
      };
      
      console.log('Fetched customer:', formattedCustomer);
      setCustomers([formattedCustomer]);
    } catch (error: any) {
      console.error('Error in useManagerCustomer hook:', error);
      
      // Handle recursive policy error specifically
      let errorMessage = error.message || 'Failed to load customers. Please try again.';
      
      if (error.message?.includes('infinite recursion')) {
        errorMessage = 'Database policy error: We are experiencing an issue with data access permissions. Please contact your administrator.';
      }
      
      setErrorMsg(errorMessage);
      
      if (!error.message?.includes('infinite recursion')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomer();
  }, [user]);
  
  // Use the shared filterCustomersBySearchTerm utility from our new structure
  // We need to map the ManagerCustomer type to the Customer type structure first
  const mappedCustomers: Customer[] = customers.map(customer => ({
    id: customer.id,
    name: customer.name,
    contact_email: customer.contact_email,
    contact_phone: customer.contact_phone,
    status: customer.status,
    city: customer.city,
    country: customer.country,
    company_id: customer.company_id,
    company: customer.name // Using company name as the company field
  }));
  
  // Now we can use the shared filter function
  const filteredCustomers = filterCustomersBySearchTerm(mappedCustomers, searchTerm)
    .map(customer => ({
      id: customer.id,
      name: customer.name,
      contact_email: customer.contact_email,
      contact_phone: customer.contact_phone,
      status: customer.status,
      city: customer.city,
      country: customer.country,
      company_id: customer.company_id
    }));
    
  return {
    customers: filteredCustomers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    fetchCustomer
  };
}
