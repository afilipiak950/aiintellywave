
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";

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
      
      console.log('Fetching customers data...');
      
      // Use a simpler query without joins or nested selects to avoid RLS recursion
      const { data: customersData, error: customersError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) {
        console.error('Error details:', customersError);
        throw customersError;
      }
      
      console.log('Customers data received:', customersData);
      
      if (customersData) {
        const formattedCustomers = customersData.map(customer => ({
          id: customer.id,
          name: customer.name,
          company: customer.name,
          email: customer.contact_email || '',
          phone: customer.contact_phone || '',
          status: 'active' as 'active' | 'inactive', 
          projects: 0,
          description: customer.description,
          contact_email: customer.contact_email,
          contact_phone: customer.contact_phone,
          city: customer.city,
          country: customer.country,
          users: [] // Initialize empty users array, we'll fetch this separately if needed
        }));
        
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      
      // Set a detailed error message based on the error type
      if (error.code === '42P17') {
        setErrorMsg('Database policy recursion error. Please contact an administrator.');
      } else if (error.code === '42P01') {
        setErrorMsg('Table not found. Check database configuration.');
      } else if (error.code === '42703') {
        setErrorMsg('Column not found. Check database schema.');
      } else if (error.message) {
        setErrorMsg(`Error: ${error.message}`);
      } else {
        setErrorMsg('Failed to load customers. Please try again.');
      }
      
      toast({
        title: "Error",
        description: errorMsg || "Failed to load customers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
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
