import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from "@/hooks/use-toast";
import { useEffect } from 'react';

/**
 * Primary function to fetch customer data from Supabase
 * Prioritizes fetching from the customers table first, then falls back to other sources
 */
async function fetchCustomerData(customerId: string): Promise<Customer | null> {
  if (!customerId) {
    console.log('No customer ID provided to fetchCustomerData');
    return null;
  }

  console.log(`Loading customer data for ID: ${customerId}`);

  // First, check directly in customers table (prioritize this source)
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select(`
      *,
      companies!inner(
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
    .eq('id', customerId)
    .maybeSingle();
  
  if (customerError) {
    console.error('Error fetching from customers table:', customerError);
  } else if (customerData) {
    console.log('Found direct customer record:', customerData);
    
    // Transform customer data to match Customer interface
    return {
      id: customerData.id,
      name: customerData.name,
      status: 'active', // Default to active for customers table
      company: customerData.companies?.name || customerData.name,
      company_name: customerData.companies?.name || customerData.name,
      company_id: customerData.companies?.id,
      email: customerData.companies?.contact_email || '',
      contact_email: customerData.companies?.contact_email,
      contact_phone: customerData.companies?.contact_phone,
      city: customerData.companies?.city,
      country: customerData.companies?.country,
      website: customerData.companies?.website,
      tags: customerData.companies?.tags,
      associated_companies: [],
      notes: customerData.conditions || '',
      monthly_flat_fee: customerData.monthly_flat_fee,
      appointments_per_month: customerData.appointments_per_month,
      start_date: customerData.start_date,
      end_date: customerData.end_date
    };
  }

  // Check in company_users if customerId is a company ID
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .select(`
      *,
      company_users!inner(
        user_id,
        email,
        full_name,
        role
      )
    `)
    .eq('id', customerId)
    .maybeSingle();

  if (companyError) {
    console.error('Error fetching company:', companyError);
  } else if (companyData) {
    console.log('Found company record:', companyData);
    
    return {
      id: customerId,
      name: companyData.name,
      status: 'active',
      company: companyData.name,
      company_name: companyData.name,
      company_id: companyData.id,
      email: companyData.contact_email || '',
      contact_email: companyData.contact_email,
      contact_phone: companyData.contact_phone,
      city: companyData.city,
      country: companyData.country,
      website: companyData.website,
      tags: companyData.tags,
      associated_companies: [],
      notes: companyData.description || ''
    };
  }

  // As a fallback, check in company_users by user_id
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
    console.error('Error fetching from company_users:', companyUserError);
  } else if (companyUserData && companyUserData.companies) {
    console.log('Found company user data:', companyUserData);
    
    return {
      id: companyUserData.user_id || customerId,
      name: companyUserData.full_name || 'System User',
      email: companyUserData.email || '',
      status: 'active',
      company: companyUserData.companies.name,
      company_name: companyUserData.companies.name,
      company_id: companyUserData.company_id,
      avatar_url: companyUserData.avatar_url,
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

  // If we've reached this point, we couldn't find the customer anywhere
  throw new Error(`No customer found with ID: ${customerId}`);
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
        console.log(`Fetching customer details for: ${customerId}`);
        const data = await fetchCustomerData(customerId);
        console.log('Fetched customer data:', data);
        return data;
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
    
    // Subscribe to customers table changes first (primary source)
    const customersTableChannel = supabase.channel(`public:customers:id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'customers',
        filter: `id=eq.${customerId}`
      }, (payload) => {
        console.log('customers table change detected:', payload);
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
      }, (payload) => {
        console.log('company_users change detected:', payload);
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
    
    // Subscribe to companies table changes
    const companiesChannel = supabase.channel(`public:companies:id=eq.${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'companies',
        filter: `id=eq.${customerId}`
      }, (payload) => {
        console.log('companies change detected:', payload);
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      })
      .subscribe();
    
    // Return cleanup function
    return () => {
      customersTableChannel && supabase.removeChannel(customersTableChannel);
      companyUsersChannel && supabase.removeChannel(companyUsersChannel);
      profilesChannel && supabase.removeChannel(profilesChannel);
      companiesChannel && supabase.removeChannel(companiesChannel);
    };
  }, [customerId, queryClient]);
  
  return null;
};
