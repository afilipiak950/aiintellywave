
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

export const useCustomerDetail = (customerId?: string) => {
  const {
    data: customer,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) {
        throw new Error('No customer ID provided');
      }

      try {
        console.log(`Fetching customer details for ID: ${customerId}`);
        
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(customerId)) {
          throw new Error('The provided ID is not a valid UUID format');
        }

        // First, check if the user exists in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error checking profile:', profileError);
          throw new Error(`Error checking profile: ${profileError.message}`);
        }
          
        // Then get company associations for this user
        const { data: companyUsersData, error: companyUserError } = await supabase
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
            is_primary_company,
            companies:company_id (
              id,
              name,
              description,
              contact_email,
              contact_phone,
              city,
              country,
              website,
              address,
              tags
            )
          `)
          .eq('user_id', customerId);

        if (companyUserError) {
          console.error('Error fetching company user data:', companyUserError);
          throw companyUserError;
        }
        
        // Check if we found any data
        if (!profileData && (!companyUsersData || companyUsersData.length === 0)) {
          // Check if the user exists in user_roles as a last resort
          const { data: userRoleData, error: userRoleError } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .eq('user_id', customerId)
            .maybeSingle();
            
          if (userRoleError || !userRoleData) {
            console.error('Customer not found in any table:', customerId);
            throw new Error('Customer ID does not exist in the system');
          }
          
          // If we get here, user exists in user_roles but has no profile or company
          return {
            id: customerId,
            user_id: customerId,
            name: 'User without Profile',
            email: '',
            status: 'active',
            role: userRoleData.role
          } as Customer;
        }

        // If we have a profile but no company associations
        if (profileData && (!companyUsersData || companyUsersData.length === 0)) {
          console.log('Found profile data but no company associations');
          return {
            id: customerId,
            user_id: customerId,
            name: profileData?.first_name && profileData?.last_name 
              ? `${profileData.first_name} ${profileData.last_name}`.trim()
              : 'Unnamed User',
            email: '',
            status: profileData?.is_active !== false ? 'active' : 'inactive',
            first_name: profileData?.first_name || '',
            last_name: profileData?.last_name || '',
            phone: profileData?.phone || '',
            position: profileData?.position || '',
            avatar: profileData?.avatar_url
          } as Customer;
        }
        
        // Find primary company based on is_primary_company flag or other logic
        let primaryCompanyAssociation = companyUsersData?.find(cu => cu.is_primary_company === true);
        
        // If no explicit primary found, try to find based on available data
        if (!primaryCompanyAssociation && companyUsersData && companyUsersData.length > 0) {
          primaryCompanyAssociation = companyUsersData[0]; // Default to first
        }
        
        // Build the associated_companies array from all company associations
        const associatedCompanies = companyUsersData?.map(association => ({
          id: association.company_id,
          name: association.companies?.name || '',
          company_id: association.company_id,
          company_name: association.companies?.name || '',
          role: association.role || '',
          is_primary: association.is_primary_company || false
        })) || [];

        // Create a primary_company object if we have a primary association
        const primaryCompany = primaryCompanyAssociation ? {
          id: primaryCompanyAssociation.company_id,
          name: primaryCompanyAssociation.companies?.name || '',
          company_id: primaryCompanyAssociation.company_id,
          role: primaryCompanyAssociation.role || ''
        } : undefined;

        // Get tags from company data if available
        const companyTags = primaryCompanyAssociation?.companies?.tags || [];

        // Combine the data
        const customerData: Customer = {
          id: customerId,
          user_id: customerId,
          name: primaryCompanyAssociation?.full_name || 
                (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
          email: primaryCompanyAssociation?.email,
          status: profileData?.is_active !== false ? 'active' : 'inactive', 
          avatar_url: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
          avatar: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
          role: primaryCompanyAssociation?.role,
          company: primaryCompanyAssociation?.companies?.name,
          company_id: primaryCompanyAssociation?.company_id,
          company_name: primaryCompanyAssociation?.companies?.name,
          contact_email: primaryCompanyAssociation?.companies?.contact_email || primaryCompanyAssociation?.email,
          contact_phone: primaryCompanyAssociation?.companies?.contact_phone,
          city: primaryCompanyAssociation?.companies?.city,
          country: primaryCompanyAssociation?.companies?.country,
          first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
          last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
          phone: profileData?.phone || '',
          position: profileData?.position || '',
          website: primaryCompanyAssociation?.companies?.website,
          address: primaryCompanyAssociation?.companies?.address,
          associated_companies: associatedCompanies,
          primary_company: primaryCompany,
          is_primary_company: primaryCompanyAssociation?.is_primary_company || false,
          tags: companyTags
        };

        console.log('Customer data successfully retrieved:', customerData);
        return customerData;
      } catch (error: any) {
        console.error('Error fetching customer detail:', error);
        
        // Provide a more specific message based on error type
        if (error.message?.includes('does not exist')) {
          throw new Error('Customer ID does not exist in the system');
        } else if (error.message?.includes('auth') || error.message?.includes('profile')) {
          throw new Error('No customer data found for this ID');
        } else if (error.message?.includes('infinite recursion')) {
          throw new Error('Database policy error: RLS policy is causing infinite recursion');
        } else if (error.message?.includes('User not allowed') || error.code === 'PGRST116') {
          throw new Error('Permission denied: You do not have permission to access this customer\'s information');
        } else if (error.message?.includes('not a valid UUID')) {
          throw new Error('The provided ID is not a valid UUID format');
        } else {
          throw error;
        }
      }
    },
    enabled: !!customerId,
    meta: {
      onError: (err: any) => {
        toast({
          title: "Fehler",
          description: err.message || "Fehler beim Laden der Kundendetails",
          variant: "destructive"
        });
      }
    }
  });

  return {
    customer,
    loading,
    error: error instanceof Error ? error.message : null,
    refreshCustomer: refetch
  };
};
