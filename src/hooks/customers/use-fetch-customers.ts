
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Customer } from './types';
import { checkIsAdminUser, formatCompanyDataToCustomers, formatCompanyUsersToCustomers } from './utils';

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

      let companiesData: any[] = [];
      let companyUsersData: any[] = [];
      
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
            description
          `);
          
        if (companiesError) {
          throw companiesError;
        } else {
          companiesData = companies || [];
        }
        
        // Also fetch all company_users for individual customers
        const { data: allCompanyUsers, error: companyUsersError } = await supabase
          .from('company_users')
          .select(`
            user_id,
            company_id,
            role,
            is_admin,
            email,
            full_name,
            first_name,
            last_name,
            avatar_url,
            companies:company_id (
              id,
              name
            )
          `);
        
        if (companyUsersError) {
          console.error('Error fetching company users:', companyUsersError);
        } else {
          companyUsersData = allCompanyUsers || [];
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
              description
            `)
            .in('id', companyIds);
          
          if (error) throw error;
          companiesData = data || [];
          
          // Get users from the same companies
          const { data: usersInSameCompanies, error: usersError } = await supabase
            .from('company_users')
            .select(`
              user_id,
              company_id,
              role,
              is_admin,
              email,
              full_name,
              first_name,
              last_name,
              avatar_url,
              companies:company_id (
                id,
                name
              )
            `)
            .in('company_id', companyIds);
          
          if (usersError) {
            console.error('Error fetching users in same companies:', usersError);
          } else {
            companyUsersData = usersInSameCompanies || [];
          }
        }
      }
      
      console.log('Companies data received:', companiesData);
      console.log('Company users data received:', companyUsersData);
      
      // Format the data to match the Customer interface
      const companiesCustomers = formatCompanyDataToCustomers(companiesData);
      const usersCustomers = formatCompanyUsersToCustomers(companyUsersData);
      
      // Combine both types of customers, removing duplicates
      const combinedCustomers = [...companiesCustomers];
      
      // Add individual users as customers, avoiding duplicates
      usersCustomers.forEach(userCustomer => {
        if (!combinedCustomers.some(c => c.id === userCustomer.id)) {
          combinedCustomers.push(userCustomer);
        }
      });
      
      console.log('Fetched customers:', combinedCustomers.length);
      setCustomers(combinedCustomers);
      
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
