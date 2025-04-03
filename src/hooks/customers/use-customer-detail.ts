
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
        // Get all company associations for this user
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
            companies:company_id (
              id,
              name,
              description,
              contact_email,
              contact_phone,
              city,
              country
            )
          `)
          .eq('user_id', customerId);

        if (companyUserError) {
          throw companyUserError;
        }

        // Get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Find primary company based on email domain (simple logic here)
        const primaryCompanyAssociation = companyUsersData && companyUsersData.length > 0 
          ? companyUsersData[0] 
          : null;
        
        // Build the associated_companies array from all company associations
        const associatedCompanies = companyUsersData?.map(association => ({
          id: association.company_id,
          name: association.companies?.name || '',
          company_id: association.company_id,
          company_name: association.companies?.name || '',
          role: association.role || '',
          is_primary: association.company_id === primaryCompanyAssociation?.company_id
        })) || [];

        // Combine the data
        const customerData: Customer = {
          id: customerId,
          name: primaryCompanyAssociation?.full_name || 
                (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
          email: primaryCompanyAssociation?.email,
          status: 'active', // Default status
          avatar_url: primaryCompanyAssociation?.avatar_url || profileData?.avatar_url,
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
          associated_companies: associatedCompanies,
        };

        return customerData;
      } catch (error: any) {
        console.error('Error fetching customer detail:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    meta: {
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to load customer details",
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
