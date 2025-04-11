
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerDebugInfo, UseCustomersResult } from './types';
import { toast } from '@/hooks/use-toast';

export const useCustomers = (): UseCustomersResult => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState<CustomerDebugInfo | undefined>(undefined);
  
  const fetchCustomers = async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Get auth user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrorMsg('Authentication error: No user found');
        setLoading(false);
        return;
      }
      
      // Begin debug info collection
      const debugData: CustomerDebugInfo = {
        userId: user.id,
        userEmail: user.email,
        timestamp: new Date().toISOString(),
        checks: []
      };
      
      // Fetch all users if admin, otherwise just fetch the current user's company associations
      let query = supabase
        .from('company_users')
        .select(`
          user_id,
          company_id,
          role,
          email,
          full_name,
          first_name,
          last_name,
          is_primary_company,
          avatar_url,
          companies:company_id (
            id,
            name,
            city,
            country,
            contact_email,
            contact_phone,
            tags
          )
        `);
        
      // If user is admin@intellywave.de, fetch all users
      if (user.email === 'admin@intellywave.de') {
        // No additional filter - get all users
        console.log("Admin user detected, fetching all users");
      } else {
        // For regular users, only fetch their own company associations
        query = query.eq('user_id', user.id);
        console.log("Regular user detected, fetching only own companies");
      }
      
      const { data: companyUsers, error: companyUsersError } = await query;
      
      if (companyUsersError) {
        throw companyUsersError;
      }
      
      // Add debug info
      debugData.checks.push({
        name: 'companyUsersCount',
        result: companyUsers?.length || 0
      });
      
      console.log("Fetched company users:", companyUsers?.length || 0);
      
      // Create customer objects from company associations
      const customersList = (companyUsers || []).map(cu => {
        // Handle potential undefined values safely with default empty object
        const companyData = cu.companies || {};
        
        return {
          id: cu.user_id,
          user_id: cu.user_id,
          email: cu.email || '',
          name: cu.full_name || `${cu.first_name || ''} ${cu.last_name || ''}`.trim() || 'Unknown',
          role: cu.role || 'customer',
          company: companyData?.name || '',
          company_id: cu.company_id,
          company_name: companyData?.name || '',
          contact_email: companyData?.contact_email || cu.email || '',
          contact_phone: companyData?.contact_phone || '',
          city: companyData?.city || '',
          country: companyData?.country || '',
          status: 'active',
          is_primary_company: cu.is_primary_company || false,
          tags: Array.isArray(companyData?.tags) ? companyData?.tags : [],
          avatar_url: cu.avatar_url || ''
        };
      });
      
      // Finalize debug info
      debugData.finalCustomersCount = customersList.length;
      console.log('Final customers count:', customersList.length);
      
      // Additional debugging for admin@intellywave.de
      if (user.email === 'admin@intellywave.de' && customersList.length === 0) {
        debugData.specialAdminNote = "This is the special admin@intellywave.de account";
        console.log("Special admin account detected with no data");
      }
      
      // Set state with results
      setCustomers(customersList);
      setDebugInfo(debugData);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setErrorMsg(error.message || 'Failed to load customers');
      toast({
        title: 'Error',
        description: `Failed to load customers: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  // Filter customers by search term
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.company && customer.company.toLowerCase().includes(searchLower))
    );
  });
  
  return {
    customers: filteredCustomers,
    loading,
    errorMsg,
    searchTerm,
    setSearchTerm,
    fetchCustomers,
    debugInfo
  };
};
