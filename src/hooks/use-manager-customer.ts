
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
      
      console.log('Fetching manager customer data using profiles approach...');
      
      // Instead of querying company_users directly, we'll query profiles
      // This avoids the RLS recursion issue in company_users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, phone, position, is_active');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Get basic company data
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
      
      // Now fetch minimal data from auth.users (no RLS there)
      // Note: This requires admin privileges and might be limited in some environments
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      let usersMap: Record<string, any> = {};
      if (!authError && authData && authData.users) {
        // Correctly type both the callback function and initial value for reduce
        usersMap = authData.users.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = {
            email: user.email,
            user_metadata: user.user_metadata || {}
          };
          return acc;
        }, {} as Record<string, any>);
      } else if (authError) {
        console.warn('Could not fetch auth users:', authError);
        // Continue without auth data - we'll use profiles as primary source
      }
      
      // Format the data for display
      const formattedCustomers = profilesData ? profilesData.map(profile => {
        const userData = usersMap[profile.id] || {};
        
        // For demo/fallback, we'll assume all users are customers of the first company
        const defaultCompanyId = companiesData && companiesData.length > 0 ? companiesData[0].id : null;
        const company = defaultCompanyId ? companiesMap[defaultCompanyId] || {} : {};
        
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(' ') || userData.user_metadata?.name || 'Unnamed User';
          
        return {
          id: profile.id,
          name: fullName,
          email: userData.email || '',
          contact_email: userData.email || '',
          contact_phone: profile.phone || '',
          role: userData.user_metadata?.role || 'customer',
          company_name: company.name || '',
          company: company.name || '',
          city: company.city || '',
          country: company.country || '',
          status: profile.is_active !== false ? 'active' : 'inactive',
          position: profile.position || '',
          users: [] // No users information for now
        };
      }) : [];
      
      console.log('Manager customers data processed:', formattedCustomers.length);
      setCustomers(formattedCustomers);
      
    } catch (error: any) {
      console.error('Error in useManagerCustomer hook:', error);
      
      let errorMessage = 'Failed to load customers data. Please try again.';
      
      // Handle specific error types with more informative messages
      if (error.code === '42P17' || (error.message && error.message.includes('recursion'))) {
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
