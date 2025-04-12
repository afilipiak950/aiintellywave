
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

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
 * Primary function to fetch customer data from Supabase
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.log('No customer ID provided to fetchCustomerData');
    return null;
  }

  console.log(`Loading customer data for ID: ${customerId}`);

  // Try to get customer from customers table
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .maybeSingle();
  
  if (customerError) {
    console.error('Error fetching from customers table:', customerError);
  } else if (customerData) {
    console.log('Found direct customer record:', customerData);
    
    return {
      id: customerData.id,
      name: customerData.name,
      status: 'active',
      company: customerData.name,
      company_name: customerData.name,
      setup_fee: customerData.setup_fee,
      price_per_appointment: customerData.price_per_appointment,
      monthly_revenue: customerData.monthly_revenue || 
        calculateMonthlyRevenue(customerData),
      email: '',
      associated_companies: [],
      notes: customerData.conditions || ''
    };
  }

  // If not found in customers, check profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', customerId)
    .maybeSingle();
  
  if (profileError) {
    console.error('Error fetching from profiles table:', profileError);
  } else if (profileData) {
    console.log('Found profile:', profileData);
    
    return {
      id: customerId,
      name: profileData.first_name && profileData.last_name
        ? `${profileData.first_name} ${profileData.last_name}`
        : 'System User',
      email: '',
      status: 'active',
      avatar_url: profileData.avatar_url,
      company: '',
      associated_companies: [],
      notes: ''
    };
  }

  // Finally, check if user exists in auth
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(
      customerId
    );

    if (authError) {
      console.error('Error fetching auth user:', authError);
    } else if (authUser && authUser.user) {
      console.log('Found auth user:', authUser.user);
      
      return {
        id: customerId,
        name: authUser.user.user_metadata?.full_name || 
              authUser.user.user_metadata?.name || 
              authUser.user.email || 
              'System User',
        email: authUser.user.email || '',
        status: 'active',
        company: '',
        associated_companies: [],
        notes: 'System user without customer profile'
      };
    }
  } catch (error) {
    console.error('Error accessing auth admin API:', error);
  }

  // If we've reached this point, we couldn't find the customer anywhere
  throw new Error(`No customer found with ID: ${customerId}`);
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
        console.log(`Fetching customer details for: ${customerId}`);
        return await fetchCustomerData(customerId);
      } catch (error: any) {
        console.error('Error loading customer:', error);
        throw new Error(error.message || 'Failed to load customer data');
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
 * Set up realtime subscription for customer updates
 */
export const useCustomerSubscription = (customerId: string | undefined) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!customerId) return;
    
    console.log(`Setting up subscription for customer: ${customerId}`);
    
    // Subscribe to customers table changes
    const customersChannel = supabase.channel(`public:customers:id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `id=eq.${customerId}`
      }, (payload) => {
        console.log('customers change detected:', payload);
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
      }, (payload) => {
        console.log('profiles change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      })
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [customerId, queryClient]);
  
  return null;
};
