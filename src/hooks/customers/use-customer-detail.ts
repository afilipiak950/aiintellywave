
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/**
 * Fetches customer data directly from the customers table
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.error('No customer ID provided');
    return null;
  }
  
  console.log(`[fetchCustomerData] Loading customer data for ID: ${customerId}`);
  
  try {
    // Direct fetch from customers table - our primary source for customer data
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
      
      // Build a proper Customer object from the customer table data
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

    // If customer wasn't found, try to fetch user data from auth user
    console.log('[fetchCustomerData] Customer not found, trying to load user profile data');
    
    // First check if the user exists in profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
    
    if (!profileError && profileData) {
      console.log('[fetchCustomerData] Found user profile:', profileData);
      
      // Also check if there are any company_users associations
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
      
      if (!companyUserError && companyUserData) {
        console.log('[fetchCustomerData] Found company_user data:', companyUserData);
        
        // Return customer data from profile and company_user
        return {
          id: customerId,
          name: companyUserData.full_name || profileData.first_name + ' ' + profileData.last_name || 'System User',
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
      
      // Return basic profile data if no company associations
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
    
    // If we didn't find a customer in the customers table or a profile, throw an error
    throw new Error(`No customer found with ID: ${customerId}`);
    
  } catch (error) {
    console.error('[fetchCustomerData] Unexpected error:', error);
    throw error;
  }
}

// Helper function to calculate monthly revenue
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
