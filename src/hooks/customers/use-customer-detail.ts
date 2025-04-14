
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Customer } from './types';
import { toast } from '@/hooks/use-toast';
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
      notes: customerData.conditions || '',
      // Add the fields that are present in customers table
      monthly_flat_fee: customerData.monthly_flat_fee,
      appointments_per_month: customerData.appointments_per_month,
      start_date: customerData.start_date,
      end_date: customerData.end_date
    };
  }

  // Check directly in companies table if customerId is a company ID
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', customerId)
    .maybeSingle();

  if (companyError) {
    console.error('Error fetching company:', companyError);
  } else if (companyData) {
    console.log('Found direct company record:', companyData);
    
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

  // As a fallback, check in company_users
  const { data: companyUsersData, error: companyUsersError } = await supabase
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
    .or(`user_id.eq.${customerId},id.eq.${customerId}`)
    .maybeSingle();

  if (companyUsersError) {
    console.error('Error fetching from company_users:', companyUsersError);
  } else if (companyUsersData && companyUsersData.companies) {
    console.log('Found company user data:', companyUsersData);
    
    return {
      id: companyUsersData.user_id || customerId,
      name: companyUsersData.full_name || 'System User',
      email: companyUsersData.email || '',
      status: 'active',
      company: companyUsersData.companies.name,
      company_name: companyUsersData.companies.name,
      company_id: companyUsersData.company_id,
      avatar_url: companyUsersData.avatar_url,
      tags: companyUsersData.companies.tags,
      associated_companies: [{
        id: companyUsersData.id,
        name: companyUsersData.companies.name,
        company_id: companyUsersData.company_id,
        role: companyUsersData.role
      }],
      notes: ''
    };
  }
  
  // Check in company_users by company_id if customerId is a company ID
  const { data: companyUsersByCompany, error: companyUsersCompanyError } = await supabase
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
    .eq('company_id', customerId)
    .maybeSingle();

  if (companyUsersCompanyError) {
    console.error('Error fetching company users by company ID:', companyUsersCompanyError);
  } else if (companyUsersByCompany && companyUsersByCompany.companies) {
    console.log('Found company user via company ID:', companyUsersByCompany);
    
    return {
      id: companyUsersByCompany.user_id || customerId,
      name: companyUsersByCompany.full_name || 'System User',
      email: companyUsersByCompany.email || '',
      status: 'active',
      company: companyUsersByCompany.companies.name,
      company_name: companyUsersByCompany.companies.name,
      company_id: companyUsersByCompany.company_id,
      avatar_url: companyUsersByCompany.avatar_url,
      tags: companyUsersByCompany.companies.tags,
      associated_companies: [{
        id: companyUsersByCompany.id,
        name: companyUsersByCompany.companies.name,
        company_id: companyUsersByCompany.company_id,
        role: companyUsersByCompany.role
      }],
      notes: ''
    };
  }

  // Last option, check profiles table
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

  // Try to get user from auth as a last resort
  try {
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(customerId);

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
    console.error('Error in auth user lookup:', error);
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
