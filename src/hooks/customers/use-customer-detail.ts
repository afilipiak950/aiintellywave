
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

// Function to check if a user exists in any of the tables we might look in
async function checkUserExistsInTables(userId: string): Promise<boolean> {
  console.log('Checking if user exists in tables with ID:', userId);
  
  try {
    // Try to find the user in profiles first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileData) {
      console.log('User found in profiles table');
      return true;
    }
    
    // If not in profiles, check company_users
    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (companyUserData) {
      console.log('User found in company_users table');
      return true;
    }
    
    // Lastly, check user_roles table
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (userRoleData) {
      console.log('User found in user_roles table');
      return true;
    }
    
    console.log('User not found in any table');
    return false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}

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
        console.log(`[useCustomerDetail] Checking if user with ID ${customerId} exists...`);
        
        // First validate if this user/customer actually exists in our tables
        const userExists = await checkUserExistsInTables(customerId);
        
        if (!userExists) {
          console.error(`[useCustomerDetail] User with ID ${customerId} does not exist in any table`);
          throw new Error(`Kunde mit ID ${customerId} existiert nicht in der Datenbank. Bitte überprüfen Sie die ID.`);
        }

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
          console.error('[useCustomerDetail] Error fetching company users data:', companyUserError);
          throw companyUserError;
        }

        console.log(`[useCustomerDetail] Found ${companyUsersData?.length || 0} company associations for user:`, companyUsersData);
        
        // If no company associations found, get basic profile data as fallback
        if (!companyUsersData || companyUsersData.length === 0) {
          console.log('[useCustomerDetail] No company associations found, fetching profile data as fallback');
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', customerId)
            .maybeSingle();
          
          if (profileError) {
            console.error('[useCustomerDetail] Error fetching profile data:', profileError);
            throw new Error(`Fehler beim Laden des Kundenprofils: ${profileError.message}`);
          }
          
          if (!profileData) {
            console.error('[useCustomerDetail] No profile data found for this user');
            throw new Error('Es wurden keine Kundendaten für diese ID gefunden. Der Kunde existiert möglicherweise nicht oder wurde gelöscht.');
          }

          // Return minimal customer data from profile
          console.log('[useCustomerDetail] Creating minimal customer data from profile:', profileData);
          
          const minimalCustomer: Customer = {
            id: customerId,
            name: profileData?.first_name && profileData?.last_name 
              ? `${profileData.first_name} ${profileData.last_name}`.trim()
              : 'Unnamed User',
            email: '',
            status: 'inactive',
            avatar: profileData?.avatar_url,
            first_name: profileData?.first_name || '',
            last_name: profileData?.last_name || '',
            phone: profileData?.phone || '',
            position: profileData?.position || '',
            website: ''
          };

          return minimalCustomer;
        }

        // Get profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        
        // Find primary company based on is_primary_company flag or email domain match
        let primaryCompanyAssociation = companyUsersData?.find(cu => cu.is_primary_company === true);
        
        // If no explicit primary found, try to find based on email domain match
        if (!primaryCompanyAssociation && companyUsersData && companyUsersData.length > 0) {
          const email = companyUsersData[0]?.email;
          
          if (email && email.includes('@')) {
            const emailDomain = email.split('@')[1].toLowerCase();
            const domainPrefix = emailDomain.split('.')[0].toLowerCase();
            
            // Find company with matching domain
            primaryCompanyAssociation = companyUsersData.find(cu => {
              if (!cu.companies) return false;
              const companyName = cu.companies.name.toLowerCase();
              return (
                companyName === domainPrefix || 
                companyName.includes(domainPrefix) || 
                domainPrefix.includes(companyName)
              );
            });
          }
        }
        
        // Fallback to first association if no primary found
        if (!primaryCompanyAssociation && companyUsersData && companyUsersData.length > 0) {
          primaryCompanyAssociation = companyUsersData[0];
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
          status: 'active', // Default status
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
          tags: companyTags // Ensure tags are properly included
        };

        console.log('Customer data with tags:', customerData);
        return customerData;
      } catch (error: any) {
        console.error('[useCustomerDetail] Error fetching customer detail:', error);
        
        // Enhanced error message for better debugging
        let errorMessage = error.message || 'Failed to load customer details';
        
        if (errorMessage.includes('No customer data found')) {
          errorMessage = `Kunde nicht gefunden: Es wurde kein Kunde mit der ID ${customerId} gefunden.`;
        }
        
        throw new Error(errorMessage);
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    meta: {
      onError: (err: any) => {
        toast({
          title: "Fehler",
          description: err.message || "Kundendaten konnten nicht geladen werden",
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
