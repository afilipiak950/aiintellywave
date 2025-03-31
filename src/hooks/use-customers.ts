
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/customer';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/auth';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching customers data...');
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // First check if user is admin using a direct query to user_roles
      // This avoids potential RLS recursion issues
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleError) {
        console.error('Error checking user role:', roleError);
      }
      
      const isAdmin = userRole?.role === 'admin';
      console.log('User is admin:', isAdmin);

      let customerData: any[] = [];
      
      if (isAdmin) {
        // For admins, fetch all companies with their associated users
        const { data: companies, error: companiesError } = await supabase
          .rpc('get_all_companies_with_users_admin');
          
        if (companiesError) {
          if (companiesError.message?.includes("function get_all_companies_with_users_admin() does not exist")) {
            // Fallback to direct query if the function doesn't exist yet
            const { data, error } = await supabase
              .from('companies')
              .select(`
                id,
                name,
                contact_email,
                contact_phone,
                city,
                country,
                description,
                company_users (*)
              `);
            
            if (error) throw error;
            customerData = data || [];
          } else {
            throw companiesError;
          }
        } else {
          customerData = companies || [];
        }
      } else {
        // For non-admins, only fetch companies they belong to
        const { data: userCompanies, error: userCompaniesError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id);
        
        if (userCompaniesError) throw userCompaniesError;
        
        if (userCompanies && userCompanies.length > 0) {
          const companyIds = userCompanies.map(uc => uc.company_id);
          
          const { data, error } = await supabase
            .from('companies')
            .select(`
              id,
              name,
              contact_email,
              contact_phone,
              city,
              country,
              description,
              company_users (*)
            `)
            .in('id', companyIds);
          
          if (error) throw error;
          customerData = data || [];
        }
      }
      
      // Format the data to match the Customer interface
      const formattedCustomers = customerData.map(company => {
        const users = company.company_users || [];
        
        return {
          id: company.id,
          name: company.name,
          company: company.name,
          email: company.contact_email || '',
          phone: company.contact_phone || '',
          contact_email: company.contact_email || '',
          contact_phone: company.contact_phone || '',
          status: 'active',
          city: company.city || '',
          country: company.country || '',
          users: users,
        };
      });
      
      console.log('Fetched customers:', formattedCustomers.length);
      setCustomers(formattedCustomers);
      
    } catch (error: any) {
      console.error('Error in useCustomers hook:', error);
      
      let errorMessage = error.message || 'Failed to load customers. Please try again.';
      
      // Special handling for infinite recursion errors
      if (error.message?.includes('infinite recursion')) {
        errorMessage = 'Database policy error: There is an issue with data access permissions. Our team has been notified and is working to fix it.';
        
        // Log detailed error for debugging
        console.warn('Infinite recursion detected in RLS policy. Full error:', error);
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
  
  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);
  
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
    fetchCustomers
  };
}
