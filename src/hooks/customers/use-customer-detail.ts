
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/**
 * Fetches customer data with a multi-source strategy:
 * 1. First tries the customers table (direct customers)
 * 2. Then tries to find the user in profiles table
 * 3. Finally checks for company associations in company_users
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.error('No customer ID provided');
    return null;
  }
  
  console.log(`[fetchCustomerData] Loading customer data for ID: ${customerId}`);
  
  try {
    // STRATEGY 1: Direct fetch from customers table
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
      
    if (customerError) {
      console.error('[fetchCustomerData] Error querying customers table:', customerError);
      throw new Error(`Error fetching customer data: ${customerError.message}`);
    } 
    
    if (customerData) {
      console.log('[fetchCustomerData] Found customer in customers table:', customerData);
      
      // Return customer data from direct customer record
      return {
        id: customerData.id,
        name: customerData.name || 'Unnamed Customer',
        status: 'active' as 'active' | 'inactive',
        company: customerData.name, // Since customer records have their own name
        company_name: customerData.name, // For consistency 
        notes: customerData.conditions || '',
        // Financial metrics directly from customer record
        setup_fee: customerData.setup_fee,
        price_per_appointment: customerData.price_per_appointment,
        monthly_revenue: customerData.monthly_revenue || 
          calculateMonthlyRevenue(customerData),
        email: '',
        associated_companies: [],
      };
    }

    // STRATEGY 2: Try to find the user in profiles table
    console.log('[fetchCustomerData] Customer not found in customers table, checking profiles...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileError) {
      console.error('[fetchCustomerData] Error querying profiles table:', profileError);
    } else if (profileData) {
      console.log('[fetchCustomerData] Found user profile:', profileData);
      
      // STRATEGY 3: Check for company associations in company_users
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            description,
            contact_email,
            contact_phone,
            city,
            country,
            tags
          )
        `)
        .eq('user_id', customerId)
        .maybeSingle();
      
      if (companyUserError) {
        console.error('[fetchCustomerData] Error querying company_users table:', companyUserError);
      } else if (companyUserData) {
        console.log('[fetchCustomerData] Found company_user data:', companyUserData);
        
        // Return customer data from profile and company_user association
        return {
          id: customerId,
          name: companyUserData.full_name || 
                (profileData.first_name && profileData.last_name ? 
                `${profileData.first_name} ${profileData.last_name}` : 'System User'),
          email: companyUserData.email || '',
          status: 'active' as 'active' | 'inactive',
          company: companyUserData.companies?.name || '',
          company_name: companyUserData.companies?.name || '',
          company_id: companyUserData.company_id,
          avatar_url: profileData.avatar_url || companyUserData.avatar_url,
          associated_companies: companyUserData.companies ? [{
            id: companyUserData.id,
            name: companyUserData.companies.name,
            company_id: companyUserData.company_id,
            role: companyUserData.role
          }] : [],
          notes: ''
        };
      }
      
      // Fall back to basic profile data if no company associations
      return {
        id: customerId,
        name: profileData.first_name && profileData.last_name
          ? `${profileData.first_name} ${profileData.last_name}`
          : 'System User',
        email: '',
        status: 'active' as 'active' | 'inactive',
        avatar_url: profileData.avatar_url,
        company: '',
        associated_companies: [],
        notes: ''
      };
    }
    
    // If we still haven't found user data, try a direct check in company_users as a last resort
    console.log('[fetchCustomerData] Trying one last check in company_users table...');
    
    const { data: lastResortCompanyUser, error: lastResortError } = await supabase
      .from('company_users')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          description,
          contact_email,
          contact_phone,
          city,
          country,
          tags
        )
      `)
      .eq('user_id', customerId)
      .maybeSingle();
      
    if (!lastResortError && lastResortCompanyUser) {
      console.log('[fetchCustomerData] Found company_user data in last resort check:', lastResortCompanyUser);
      
      return {
        id: customerId,
        name: lastResortCompanyUser.full_name || 'System User',
        email: lastResortCompanyUser.email || '',
        status: 'active' as 'active' | 'inactive',
        company: lastResortCompanyUser.companies?.name || '',
        company_name: lastResortCompanyUser.companies?.name || '',
        company_id: lastResortCompanyUser.company_id,
        avatar_url: lastResortCompanyUser.avatar_url,
        associated_companies: lastResortCompanyUser.companies ? [{
          id: lastResortCompanyUser.id,
          name: lastResortCompanyUser.companies.name,
          company_id: lastResortCompanyUser.company_id,
          role: lastResortCompanyUser.role
        }] : [],
        notes: ''
      };
    }
    
    // If we've exhausted all options, throw an error
    throw new Error(`No customer found with ID: ${customerId}`);
    
  } catch (error) {
    console.error('[fetchCustomerData] Unexpected error:', error);
    throw error;
  }
}

/**
 * Helper function to calculate monthly revenue from customer data
 */
function calculateMonthlyRevenue(customerData: any): number {
  if (customerData.monthly_revenue !== null && customerData.monthly_revenue !== undefined) {
    return customerData.monthly_revenue;
  }
  
  let calculatedRevenue = 0;
  
  // Add monthly flat fee if present
  if (customerData.monthly_flat_fee) {
    calculatedRevenue += customerData.monthly_flat_fee;
  }
  
  // Add revenue from appointments if present
  if (customerData.price_per_appointment && customerData.appointments_per_month) {
    calculatedRevenue += customerData.price_per_appointment * customerData.appointments_per_month;
  }
  
  return calculatedRevenue;
}

/**
 * Hook to fetch and manage customer detail data
 */
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

/**
 * Set up realtime subscription for customer updates across multiple tables
 */
export const useCustomerSubscription = (customerId: string | undefined) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!customerId) return;
    
    console.log(`[useCustomerSubscription] Setting up subscription for customer: ${customerId}`);
    
    // Subscribe to customers table changes
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
      
    // Subscribe to company_users table changes
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
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(companyUsersChannel);
    };
  }, [customerId, queryClient]);
  
  return null;
};
