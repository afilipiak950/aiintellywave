
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Customer } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

export function useManagerCustomer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      
      // First, get profiles data which is more reliable than querying company_users directly
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, phone, position, is_active');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Get company data to map to users
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
          if (company.id) {
            companiesMap[company.id] = company;
          }
        });
      }
      
      // Fetch company_user associations using the improved security definer function approach
      let companyUsersData: any[] = [];
      let companyUsersError = null;
      
      try {
        const response = await supabase
          .from('company_users')
          .select('user_id, company_id, role, email');
          
        companyUsersData = response.data || [];
        companyUsersError = response.error;
      } catch (err) {
        console.error('Error fetching company users:', err);
        companyUsersError = err;
        // Continue with profiles data only
      }
      
      if (companyUsersError) {
        console.warn('Proceeding with limited data due to company_users query error:', companyUsersError);
      }
      
      // Create a map of user to company relations
      const userCompanyMap: Record<string, any> = {};
      if (companyUsersData && companyUsersData.length > 0) {
        companyUsersData.forEach(relation => {
          if (relation.user_id) {
            userCompanyMap[relation.user_id] = {
              company_id: relation.company_id,
              role: relation.role,
              email: relation.email
            };
          }
        });
      }
      
      // Try to get user metadata as a fallback
      let authUsers: Record<string, any> = {};
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authData && authData.users) {
          // Fix TypeScript error by properly typing the accumulator and return value
          authUsers = authData.users.reduce((acc: Record<string, any>, user: any) => {
            acc[user.id] = {
              email: user.email,
              user_metadata: user.user_metadata || {}
            };
            return acc;
          }, {} as Record<string, any>);
        }
      } catch (error) {
        console.warn('Could not fetch auth users:', error);
        // Continue without auth data
      }
      
      // Format the profiles data into customer objects
      const formattedCustomers = profilesData?.map(profile => {
        const userId = profile.id;
        const userCompany = userCompanyMap[userId] || {};
        const authUser = authUsers[userId] || {};
        
        // Get company details using the company_id from the relationship
        const companyId = userCompany.company_id;
        const company = companyId ? companiesMap[companyId] || {} : {};
        
        // Determine name from available data
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ') || 
                        authUser.user_metadata?.name || 
                        'Unnamed User';
        
        // Use email from company_users relation or auth user
        const email = userCompany.email || authUser.email || '';
        
        // Create the customer object with all available data
        return {
          id: userId,
          name: fullName,
          email: email,
          contact_email: email,
          contact_phone: profile.phone || '',
          role: userCompany.role || authUser.user_metadata?.role || 'customer',
          company_name: company.name || '',
          company: company.name || '',
          city: company.city || '',
          country: company.country || '',
          status: profile.is_active !== false ? 'active' : 'inactive',
          position: profile.position || '',
          users: [] // Empty users array for now
        } as Customer;
      }) || [];
      
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
