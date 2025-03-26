
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";

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
      
      // Simplify the query to avoid RLS recursion
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description, contact_email, contact_phone, city, country');
      
      if (companiesError) {
        console.error('Error details:', companiesError);
        throw companiesError;
      }
      
      console.log('Customers data received:', companiesData);
      
      if (companiesData) {
        const formattedCustomers = companiesData.map(company => ({
          id: company.id,
          name: company.name,
          company: company.name,
          email: company.contact_email || '',
          phone: company.contact_phone || '',
          status: 'active' as 'active' | 'inactive', 
          projects: 0,
          description: company.description,
          contact_email: company.contact_email,
          contact_phone: company.contact_phone,
          city: company.city,
          country: company.country,
          users: [] // Initialize empty users array
        }));
        
        // For each company, fetch associated users in a separate query
        for (const customer of formattedCustomers) {
          try {
            const { data: usersData } = await supabase
              .from('company_users')
              .select('user_id')
              .eq('company_id', customer.id);
              
            if (usersData && usersData.length > 0) {
              customer.users = usersData.map(user => ({
                id: user.user_id,
                email: user.user_id // Just using the ID since we don't have email data
              }));
            }
          } catch (userError) {
            console.warn(`Error fetching users for company ${customer.id}:`, userError);
            // Continue with other customers even if user fetching fails
          }
        }
        
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      
      // Set a detailed error message based on the error type
      if (error.code === '42P17') {
        setErrorMsg('Database policy recursion error. Please check your RLS policies.');
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
