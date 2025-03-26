
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Customer } from '@/types/customer';

export type { Customer };

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
      
      // Step 1: Fetch company_users data
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          is_admin,
          companies:company_id (
            id,
            name,
            description,
            contact_email,
            contact_phone,
            city,
            country
          )
        `);
      
      if (companyUsersError) {
        console.error('Error fetching company users data:', companyUsersError);
        throw companyUsersError;
      }
      
      console.log('Company users data received:', companyUsersData);
      
      // Step 2: Fetch profiles data separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching profiles data:', profilesError);
        throw profilesError;
      }
      
      // Create a map of profiles by id for easy lookup
      const profilesMap: Record<string, any> = {};
      profilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      // Step 3: Fetch auth users data to get emails
      let authUsers: any[] = [];
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) {
          console.warn('Error fetching auth users:', error);
        } else if (data && data.users) {
          authUsers = data.users;
        }
      } catch (err) {
        console.warn('Could not fetch auth users:', err);
      }
      
      // Create a map of emails by user id
      const emailMap: Record<string, string> = {};
      authUsers.forEach(user => {
        if (user.id && user.email) {
          emailMap[user.id] = user.email;
        }
      });
      
      // Step 4: Format data into Customer objects
      const formattedCustomers: Customer[] = companyUsersData.map(companyUser => {
        const profile = profilesMap[companyUser.user_id] || {};
        const company = companyUser.companies || {};
        const email = emailMap[companyUser.user_id] || '';
        
        let fullName = 'Unnamed User';
        if (profile) {
          const firstName = profile.first_name || '';
          const lastName = profile.last_name || '';
          if (firstName || lastName) {
            fullName = `${firstName} ${lastName}`.trim();
          }
        }
        
        return {
          id: companyUser.user_id,
          name: fullName,
          email: email,
          phone: profile.phone || '',
          status: profile.is_active ? 'active' : 'inactive',
          avatar: profile.avatar_url,
          position: profile.position || '',
          company: company.name || '',
          company_id: company.id || '',
          company_name: company.name || '',
          company_role: companyUser.role || '',
          city: company.city || '',
          country: company.country || '',
          contact_email: company.contact_email || '',
          contact_phone: company.contact_phone || ''
        };
      });
      
      console.log('Formatted customers data:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      const errorMsg = error.code 
        ? `Database error (${error.code}): ${error.message}`
        : error.message 
          ? `Error: ${error.message}`
          : 'Failed to load customers. Please try again.';
      
      setErrorMsg(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    const emailMatch = (customer.email?.toLowerCase().includes(searchLower)) || false;
    const companyMatch = (customer.company?.toLowerCase().includes(searchLower)) || false;
    const roleMatch = (customer.role?.toLowerCase().includes(searchLower)) || false;
    
    return nameMatch || emailMatch || companyMatch || roleMatch;
  });
    
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
