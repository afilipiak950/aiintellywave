
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UICustomer } from '@/types/customer';
import { toast } from './use-toast';

// Extract fetch logic for better reusability
const fetchCustomerDetail = async (customerId?: string): Promise<UICustomer | null> => {
  if (!customerId) {
    throw new Error('No customer ID provided');
  }

  try {
    console.log(`[fetchCustomerDetail] Fetching customer details for ID: ${customerId}`);

    // Get the company user data - should be a single record due to our constraint
    const { data: companyUserData, error: companyUserError } = await supabase
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
      .eq('user_id', customerId)
      .maybeSingle();

    if (companyUserError) {
      console.error('[fetchCustomerDetail] Error fetching company user data:', companyUserError);
      throw companyUserError;
    }

    console.log(`[fetchCustomerDetail] Found company user record:`, companyUserData);

    // If no company association found, get basic profile data as fallback
    if (!companyUserData) {
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

    // Combine the data
    const customerData: UICustomer = {
      id: customerId,
      name: companyUserData?.full_name || 
            (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
      email: companyUserData?.email,
      status: 'active', // Default status
      avatar: companyUserData?.avatar_url || (profileData ? profileData.avatar_url : undefined),
      role: companyUserData?.role,
      company: companyUserData?.companies?.name,
      company_id: companyUserData?.company_id,
      company_name: companyUserData?.companies?.name,
      company_role: companyUserData?.role,
      contact_email: companyUserData?.companies?.contact_email || companyUserData?.email,
      contact_phone: companyUserData?.companies?.contact_phone,
      city: companyUserData?.companies?.city,
      country: companyUserData?.companies?.country,
      description: companyUserData?.companies?.description,
      website: companyUserData?.companies?.website, // Added website property now that it's in the type definition
      
      // Profile data with fallbacks
      first_name: profileData?.first_name || companyUserData?.first_name || '',
      last_name: profileData?.last_name || companyUserData?.last_name || '',
      phone: profileData?.phone || '',
      position: profileData?.position || '',
      
      // Default values for missing fields
      address: '',
      department: '',
      job_title: '',
      company_size: undefined,
      linkedin_url: '',
      notes: '',

      // Add the associated companies as array with single item
      associated_companies: companyUserData ? [{
        id: companyUserData.company_id,
        name: companyUserData.companies?.name || '',
        company_id: companyUserData.company_id,
        company_name: companyUserData.companies?.name || '',
        role: companyUserData.role
      }] : []
    };

    console.log('[fetchCustomerDetail] Customer data assembled successfully');
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
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to load customer details",
        variant: "destructive"
      });
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
