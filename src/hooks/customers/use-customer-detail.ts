
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/**
 * Fetches customer data from the database
 * Tries multiple sources: customers table, profiles, and company associations
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.log('No customer ID provided to fetchCustomerData');
    return null;
  }
  
  console.log(`Loading customer data for ID: ${customerId}`);
  
  try {
    // 1. First try customers table
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
    
    if (customerError) {
      console.error('Error querying customers table:', customerError);
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
    
    // 2. Try profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error querying profiles table:', profileError);
    } else if (profileData) {
      console.log('Found user profile:', profileData);
      
      // Check for company associations
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
        console.error('Error querying company_users table:', companyUserError);
      } else if (companyUserData?.companies) {
        console.log('Found company association:', companyUserData);
        
        return {
          id: customerId,
          name: companyUserData.full_name || 
                (profileData.first_name && profileData.last_name ? 
                `${profileData.first_name} ${profileData.last_name}` : 'System User'),
          email: companyUserData.email || '',
          status: 'active',
          company: companyUserData.companies.name,
          company_name: companyUserData.companies.name,
          company_id: companyUserData.company_id,
          avatar_url: profileData.avatar_url || companyUserData.avatar_url,
          tags: companyUserData.companies.tags,
          associated_companies: [{
            id: companyUserData.id,
            name: companyUserData.companies.name,
            company_id: companyUserData.company_id,
            role: companyUserData.role
          }],
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
        status: 'active',
        avatar_url: profileData.avatar_url,
        company: '',
        associated_companies: [],
        notes: ''
      };
    }
    
    // 3. Last resort - try direct company_users query
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
      
    if (lastResortError) {
      console.error('Error in last resort query:', lastResortError);
    } else if (lastResortCompanyUser?.companies) {
      console.log('Found company_user in last resort check:', lastResortCompanyUser);
      
      return {
        id: customerId,
        name: lastResortCompanyUser.full_name || 'System User',
        email: lastResortCompanyUser.email || '',
        status: 'active',
        company: lastResortCompanyUser.companies.name,
        company_name: lastResortCompanyUser.companies.name,
        company_id: lastResortCompanyUser.company_id,
        avatar_url: lastResortCompanyUser.avatar_url,
        tags: lastResortCompanyUser.companies.tags,
        associated_companies: [{
          id: lastResortCompanyUser.id,
          name: lastResortCompanyUser.companies.name,
          company_id: lastResortCompanyUser.company_id,
          role: lastResortCompanyUser.role
        }],
        notes: ''
      };
    }
    
    throw new Error(`No customer found with ID: ${customerId}`);
    
  } catch (error: any) {
    console.error('Unexpected error in fetchCustomerData:', error);
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
 * Set up realtime subscription for customer updates across multiple tables
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
