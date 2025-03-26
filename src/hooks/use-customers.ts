
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
      
      console.log('Fetching companies data...');
      
      // Use simple query without joins to avoid RLS recursion
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description, contact_email, contact_phone, city, country');
      
      if (companiesError) {
        console.error('Error details:', companiesError);
        throw companiesError;
      }
      
      console.log('Companies data received:', companiesData);
      
      if (companiesData) {
        // Transform to customer format
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
        
        // Now fetch users for each company in a separate query to avoid recursion
        for (const customer of formattedCustomers) {
          try {
            // Using a direct auth.uid check to avoid the recursion
            const { data: usersData, error: usersError } = await supabase
              .from('company_users')
              .select('user_id')
              .eq('company_id', customer.id);
              
            if (usersError) {
              console.warn(`Error fetching users for company ${customer.id}:`, usersError);
            } else if (usersData && usersData.length > 0) {
              customer.users = usersData.map(user => ({
                id: user.user_id,
                email: user.user_id // Just using the ID since we don't have email data
              }));
            }
          } catch (userError) {
            console.warn(`Error fetching users for company ${customer.id}:`, userError);
          }
        }
        
        setCustomers(formattedCustomers);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      
      // Set a detailed error message based on the error type
      if (error.code) {
        setErrorMsg(`Database error (${error.code}): ${error.message}`);
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
