
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { toast } from './use-toast';
import { useEffect } from 'react';

// Extract fetch logic for better reusability
const fetchCustomerDetail = async (customerId?: string): Promise<UICustomer | null> => {
  if (!customerId) {
    throw new Error('No customer ID provided');
  }

  try {
    console.log(`[fetchCustomerDetail] Fetching customer details for ID: ${customerId}`);

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
        last_sign_in_at,
        created_at_auth,
        companies:company_id (
          id,
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country,
          website
        )
      `)
      .eq('user_id', customerId);

    if (companyUserError) {
      console.error('[fetchCustomerDetail] Error fetching company user data:', companyUserError);
      throw companyUserError;
    }

    console.log(`[fetchCustomerDetail] Found ${companyUsersData?.length || 0} company associations for user:`, companyUsersData);
    
    // If no company associations found, get basic profile data as fallback
    if (!companyUsersData || companyUsersData.length === 0) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      
      if (profileError || !profileData) {
        throw new Error('No customer data found for this ID');
      }

      // Return minimal customer data from profile
      const minimalCustomer: UICustomer = {
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

    // Get profile data with only the columns that exist
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        first_name,
        last_name,
        avatar_url,
        phone,
        position
      `)
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileError) {
      console.error('[fetchCustomerDetail] Error fetching profiles data:', profileError);
      // Continue with partial data rather than throwing
    }

    // Get the primary company association (first one, usually the one created first)
    const primaryCompanyAssociation = companyUsersData[0];

    // Build the associated_companies array from all company associations
    const associatedCompanies = companyUsersData.map(association => ({
      id: association.company_id,
      name: association.companies?.name || '',
      company_id: association.company_id,
      company_name: association.companies?.name || '',
      role: association.role || ''
    }));

    // Combine the data
    const customerData: UICustomer = {
      id: customerId,
      name: primaryCompanyAssociation?.full_name || 
            (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
      email: primaryCompanyAssociation?.email,
      status: 'active', // Default status
      avatar: primaryCompanyAssociation?.avatar_url || (profileData ? profileData.avatar_url : undefined),
      role: primaryCompanyAssociation?.role,
      company: primaryCompanyAssociation?.companies?.name,
      company_id: primaryCompanyAssociation?.company_id,
      company_name: primaryCompanyAssociation?.companies?.name,
      company_role: primaryCompanyAssociation?.role,
      contact_email: primaryCompanyAssociation?.companies?.contact_email || primaryCompanyAssociation?.email,
      contact_phone: primaryCompanyAssociation?.companies?.contact_phone,
      city: primaryCompanyAssociation?.companies?.city,
      country: primaryCompanyAssociation?.companies?.country,
      description: primaryCompanyAssociation?.companies?.description,
      website: primaryCompanyAssociation?.companies?.website,
      
      // Profile data with fallbacks
      first_name: profileData?.first_name || primaryCompanyAssociation?.first_name || '',
      last_name: profileData?.last_name || primaryCompanyAssociation?.last_name || '',
      phone: profileData?.phone || '',
      position: profileData?.position || '',
      
      // Default values for missing fields
      address: '',
      department: '',
      job_title: '',
      company_size: undefined,
      linkedin_url: '',
      notes: '',

      // Add all associated companies as array
      associated_companies: associatedCompanies,
    };

    console.log('[fetchCustomerDetail] Customer data assembled successfully:', customerData);
    return customerData;
  } catch (error: any) {
    console.error('[fetchCustomerDetail] Error fetching customer detail:', error);
    throw error;
  }
};

// Set up realtime subscription for customer updates
export const setupCustomerSubscription = (
  customerId: string | undefined,
  queryClient: any
) => {
  if (!customerId) return () => {};
  
  console.log(`[setupCustomerSubscription] Setting up subscriptions for customer: ${customerId}`);
  
  // Subscribe to both profiles and company_users changes
  const profilesChannel = supabase.channel(`public:profiles:id=eq.${customerId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'profiles',
      filter: `id=eq.${customerId}`
    }, (payload) => {
      console.log('[setupCustomerSubscription] Profiles update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    })
    .subscribe();
    
  const companyUsersChannel = supabase.channel(`public:company_users:user_id=eq.${customerId}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'company_users',
      filter: `user_id=eq.${customerId}`
    }, (payload) => {
      console.log('[setupCustomerSubscription] Company users update received:', payload);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    })
    .subscribe();
    
  // Return cleanup function
  return () => {
    console.log('[setupCustomerSubscription] Cleaning up subscriptions');
    supabase.removeChannel(profilesChannel);
    supabase.removeChannel(companyUsersChannel);
  };
};

export const useCustomerDetail = (customerId?: string) => {
  const queryClient = useQueryClient();
  
  const {
    data: customer,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetchCustomerDetail(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
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

  // Set up realtime subscription
  useEffect(() => {
    const cleanup = setupCustomerSubscription(customerId, queryClient);
    return cleanup;
  }, [customerId, queryClient]);

  return {
    customer,
    loading,
    error: error instanceof Error ? error.message : null,
    refreshCustomer: refetch
  };
};
