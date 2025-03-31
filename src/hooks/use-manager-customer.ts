
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

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
  
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching companies data for manager...');
      
      // Use a more reliable query approach with no JOINs to avoid RLS issues
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, contact_email, contact_phone, city, country, description');
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }
      
      // Format the companies data for display
      const formattedCustomers = companiesData.map(company => ({
        id: company.id,
        name: company.name || 'Unnamed Company',
        contact_email: company.contact_email || '',
        contact_phone: company.contact_phone || '',
        status: 'active' as const,
        city: company.city || '',
        country: company.country || '',
        company_id: company.id
      }));
      
      console.log('Fetched customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error in useManagerCustomer hook:', error);
      
      // Handle recursive policy error specifically
      if (error.message?.includes('infinite recursion')) {
        setErrorMsg('Database policy error. Please try again later or contact support.');
      } else {
        setErrorMsg(error.message || 'Failed to load customers. Please try again.');
      }
      
      toast({
        title: "Error",
        description: error.message || 'Failed to load customers. Please try again.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCustomer();
  }, []);
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.contact_email?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower) ||
      customer.country?.toLowerCase().includes(searchLower)
    );
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
