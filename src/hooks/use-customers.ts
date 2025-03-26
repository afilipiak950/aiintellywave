
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
      
      // Direct query instead of unavailable RPC function
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
        
        // Handle user data separately without nested queries
        try {
          // Single query to get all company_users
          const { data: allCompanyUsers, error: usersError } = await supabase
            .from('company_users')
            .select('company_id, user_id');
            
          if (usersError) {
            console.warn('Error fetching users data:', usersError);
          } else if (allCompanyUsers) {
            // Process the data in memory instead of making multiple queries
            formattedCustomers.forEach(customer => {
              const customerUsers = allCompanyUsers.filter(cu => 
                cu.company_id === customer.id
              );
              
              if (customerUsers.length > 0) {
                customer.users = customerUsers.map(cu => ({
                  id: cu.user_id,
                  email: cu.user_id
                }));
              }
            });
          }
        } catch (userError: any) {
          console.warn(`Error fetching users data:`, userError);
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
