
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches customer data from the appropriate tables based on the provided ID
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.error('No customer ID provided');
    return null;
  }
  
  console.log(`[fetchCustomerData] Loading customer data for ID: ${customerId}`);
  
  try {
    // Strategy 1: Try customers table first (primary source for actual customers)
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (customerError) {
      console.error('[fetchCustomerData] Error querying customers table:', customerError);
    } else if (customerData) {
      console.log('[fetchCustomerData] Found customer in customers table:', customerData);
      
      // Get additional company data if the customer entry has the same ID as a company
      let companyData = null;
      try {
        const { data: companyResult } = await supabase
          .from('companies')
          .select('*')
          .eq('id', customerData.id)
          .maybeSingle();
        companyData = companyResult;
      } catch (err) {
        console.log('No matching company found with same ID');
      }
      
      return {
        id: customerData.id,
        name: customerData.name || 'Unnamed Customer',
        status: 'active' as 'active' | 'inactive',
        company: customerData.name,
        company_name: customerData.name,
        notes: customerData.conditions || '',
        // Add these as optional fields that exist in the Customer type
        setup_fee: customerData.setup_fee,
        price_per_appointment: customerData.price_per_appointment,
        monthly_revenue: customerData.monthly_revenue,
        // Company data (if available)
        company_id: companyData?.id,
        contact_email: companyData?.contact_email || '',
        contact_phone: companyData?.contact_phone || '',
        address: companyData?.address || '',
        website: companyData?.website || '',
        city: companyData?.city || '',
        country: companyData?.country || '',
        tags: companyData?.tags || [],
        // Default user fields
        email: '',
        associated_companies: []
      };
    }
    
    // Strategy 2: Try company_users with joined company data
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
        companies:company_id (
          id,
          name,
          city,
          country,
          contact_email,
          contact_phone,
          tags,
          website,
          address
        )
      `)
      .eq('user_id', customerId)
      .maybeSingle();
      
    if (companyUserError) {
      console.error('[fetchCustomerData] Error querying company_users table:', companyUserError);
    } else if (companyUserData) {
      console.log('[fetchCustomerData] Found user in company_users:', companyUserData);
      
      // Get all company associations for this user
      const { data: allCompanyAssociations } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          is_admin,
          is_primary_company,
          companies:company_id (name)
        `)
        .eq('user_id', customerId);
      
      const associatedCompanies = (allCompanyAssociations || []).map(assoc => ({
        id: assoc.company_id,
        name: assoc.companies?.name || '',
        company_id: assoc.company_id,
        company_name: assoc.companies?.name || '',
        role: assoc.role || '',
        is_primary: assoc.is_primary_company || false
      }));
      
      // Get additional profile data if available
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      
      // Handle special email domain cases
      const email = companyUserData.email || '';
      let companyName = companyUserData.companies?.name || '';
      
      if (email.toLowerCase().includes('@fact-talents.de')) {
        companyName = 'Fact Talents';
      } else if (email.toLowerCase().includes('@wbungert.com')) {
        companyName = 'Bungert';
      } else if (email.toLowerCase().includes('@teso-specialist.de')) {
        companyName = 'Teso Specialist';
      }
      
      return {
        id: customerId,
        user_id: customerId,
        name: companyUserData.full_name || 
              `${companyUserData.first_name || ''} ${companyUserData.last_name || ''}`.trim() ||
              (profileData ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 'Unknown'),
        email: companyUserData.email,
        status: 'active' as 'active' | 'inactive',
        avatar_url: companyUserData.avatar_url || profileData?.avatar_url,
        avatar: companyUserData.avatar_url || profileData?.avatar_url,
        role: companyUserData.role,
        company: companyName,
        company_id: companyUserData.company_id,
        company_name: companyName,
        contact_email: companyUserData.companies?.contact_email || companyUserData.email,
        contact_phone: companyUserData.companies?.contact_phone,
        city: companyUserData.companies?.city,
        country: companyUserData.companies?.country,
        first_name: companyUserData.first_name || profileData?.first_name || '',
        last_name: companyUserData.last_name || profileData?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        website: companyUserData.companies?.website,
        address: companyUserData.companies?.address,
        associated_companies: associatedCompanies,
        primary_company: associatedCompanies.find(c => c.is_primary) || associatedCompanies[0],
        tags: companyUserData.companies?.tags || [],
        notes: ''
      };
    }
    
    // Strategy 3: Try profiles as a last resort
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (profileError) {
      console.error('[fetchCustomerData] Error querying profiles table:', profileError);
    } else if (profileData) {
      console.log('[fetchCustomerData] Found user in profiles:', profileData);
      
      // Try to get company association for this profile
      const { data: companyAssociation } = await supabase
        .from('company_users')
        .select(`
          company_id,
          role,
          email,
          companies:company_id (
            name,
            city,
            country,
            contact_email,
            contact_phone,
            website,
            address
          )
        `)
        .eq('user_id', customerId)
        .maybeSingle();
      
      const fullName = profileData?.first_name && profileData?.last_name 
        ? `${profileData.first_name} ${profileData.last_name}`.trim()
        : 'Unnamed User';
        
      return {
        id: customerId,
        user_id: customerId,
        name: fullName,
        email: companyAssociation?.email || '',
        status: 'active' as 'active' | 'inactive',
        avatar: profileData?.avatar_url,
        avatar_url: profileData?.avatar_url,
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: profileData?.phone || '',
        position: profileData?.position || '',
        company: companyAssociation?.companies?.name || '',
        company_id: companyAssociation?.company_id,
        company_name: companyAssociation?.companies?.name || '',
        contact_email: companyAssociation?.companies?.contact_email || companyAssociation?.email || '',
        contact_phone: companyAssociation?.companies?.contact_phone || '',
        city: companyAssociation?.companies?.city || '',
        country: companyAssociation?.companies?.country || '',
        website: companyAssociation?.companies?.website || '',
        address: companyAssociation?.companies?.address || '',
        associated_companies: companyAssociation ? [{
          id: companyAssociation.company_id,
          name: companyAssociation.companies?.name || '',
          company_id: companyAssociation.company_id,
          role: companyAssociation.role
        }] : [],
        notes: ''
      };
    }
    
    // Check if ID exists in auth table but not in our tables
    try {
      // Use the raw SQL approach instead of the view since the view is not recognized by TypeScript
      const { data: userExistsCheck, error: checkError } = await supabase
        .rpc('check_user_exists', { user_id_param: customerId });
      
      if (!checkError && userExistsCheck === true) {
        console.log('[fetchCustomerData] User exists in auth but not in customer tables');
        throw new Error(`User ID exists in auth system but is not associated with a customer record`);
      }
    } catch (checkError) {
      console.log('[fetchCustomerData] Error checking user existence:', checkError);
    }
    
    // If we got here, the ID was not found in any table
    throw new Error(`No customer found with ID: ${customerId}`);
  } catch (error) {
    console.error('[fetchCustomerData] Unexpected error:', error);
    throw error;
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
        return await fetchCustomerData(customerId);
      } catch (error: any) {
        console.error('[useCustomerDetail] Error loading customer:', error);
        
        // Format error message for better user understanding
        let errorMessage = error.message;
        
        if (errorMessage.includes('infinite recursion') || 
            errorMessage.includes('policy') || 
            errorMessage.includes('permission denied')) {
          errorMessage = `Database access error: There may be an issue with data permissions. Please contact support.`;
        }
        
        throw new Error(errorMessage);
      }
    },
    enabled: !!customerId,
    meta: {
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message || "Failed to load customer data",
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

// Set up realtime subscription for customer updates
export const useCustomerSubscription = (customerId: string | undefined) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!customerId) return;
    
    console.log(`[useCustomerSubscription] Setting up subscriptions for customer: ${customerId}`);
    
    // Subscribe to profiles table changes
    const profilesChannel = supabase.channel(`public:profiles:id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${customerId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      })
      .subscribe();
      
    // Add subscription to customers table changes
    const customersChannel = supabase.channel(`public:customers:id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `id=eq.${customerId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      })
      .subscribe();
      
    // Add subscription to company_users table changes
    const companyUsersChannel = supabase.channel(`public:company_users:user_id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'company_users',
        filter: `user_id=eq.${customerId}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      })
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(companyUsersChannel);
    };
  }, [customerId, queryClient]);
  
  return null;
};
