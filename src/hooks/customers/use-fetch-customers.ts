
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Customer } from './types';
import { checkIsAdminUser, formatCompanyDataToCustomers } from './utils';

export const useFetchCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const fetchCustomers = async (userId: string, userEmail?: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      console.log('Fetching customers data...');
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Determine if user is admin
      const isAdmin = await checkIsAdminUser(userId, userEmail);
      console.log('User is admin:', isAdmin);

      let customerData: any[] = [];
      
      if (isAdmin) {
        // For admins, fetch all companies
        const { data: companies, error: companiesError } = await supabase
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
          
        if (companiesError) {
          throw companiesError;
        } else {
          customerData = companies || [];
        }
      } else {
        // For non-admins, only fetch companies they belong to
        const { data: userCompanies, error: userCompaniesError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userId);
        
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
      
      console.log('Companies data received:', customerData);
      console.log('Companies fetched:', customerData.length);
      
      // Format the data to match the Customer interface
      const formattedCustomers = formatCompanyDataToCustomers(customerData);
      
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
  
  return {
    customers,
    loading,
    errorMsg,
    fetchCustomers,
    setCustomers
  };
};
