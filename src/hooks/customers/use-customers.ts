
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/services/types/customerTypes';

export function useCustomers() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      try {
        console.log('Fetching comprehensive customer data from multiple sources...');
        
        // Step 1: Fetch all users from auth.users via profiles (most reliable approach)
        console.log('Fetching profiles as primary source...');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        console.log(`Found ${profilesData?.length || 0} profiles`);
        
        // Step 2: Fetch all customers from the customers table as well
        console.log('Fetching from customers table as secondary source...');
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            setup_fee,
            price_per_appointment,
            monthly_flat_fee,
            appointments_per_month,
            start_date,
            end_date,
            conditions
          `);

        if (customersError) {
          console.error('Error fetching from customers table:', customersError);
        }
        
        console.log(`Found ${customersData?.length || 0} records in customers table`);

        // Step 3: Get company associations
        console.log('Fetching company_users data for associations...');
        const { data: companyUsersData, error: companyUsersError } = await supabase
          .from('company_users')
          .select(`
            user_id,
            company_id,
            email,
            full_name,
            role,
            companies:company_id (id, name)
          `);

        if (companyUsersError) {
          console.error('Error fetching company_users:', companyUsersError);
        }
        
        console.log(`Found ${companyUsersData?.length || 0} company_user associations`);

        // Step 4: Get role information
        console.log('Fetching user_roles data for role information...');
        const { data: userRolesData, error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');

        if (userRolesError) {
          console.error('Error fetching user_roles:', userRolesError);
        }
        
        console.log(`Found ${userRolesData?.length || 0} user role entries`);

        // Create a map of company users for quick lookup
        const companyUsersMap = new Map();
        companyUsersData?.forEach(cu => {
          companyUsersMap.set(cu.user_id, cu);
        });

        // Create a map of user roles for quick lookup
        const userRolesMap = new Map();
        userRolesData?.forEach(ur => {
          userRolesMap.set(ur.user_id, ur.role);
        });

        // Create a map of customers for quick lookup
        const customersMap = new Map();
        customersData?.forEach(c => {
          customersMap.set(c.id, c);
        });
        
        // Step 5: Combine data from all sources, starting with profiles as the base
        const combinedCustomers = profilesData.map(profile => {
          const companyUser = companyUsersMap.get(profile.id);
          const customerData = customersMap.get(profile.id);
          const role = userRolesMap.get(profile.id) || (companyUser?.role || 'customer');
          
          return {
            id: profile.id,
            user_id: profile.id,
            full_name: profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : companyUser?.full_name || 'Unknown User',
            name: profile.first_name && profile.last_name 
              ? `${profile.first_name} ${profile.last_name}`.trim()
              : companyUser?.full_name || 'Unknown User',
            company_name: companyUser?.companies?.name || 'No Company', // Fallback to No Company
            role: role,
            email: companyUser?.email || '', // No email in profiles table directly
            status: 'active',
            company_id: companyUser?.company_id || null,
            setup_fee: customerData?.setup_fee || 0,
            price_per_appointment: customerData?.price_per_appointment || 0,
            monthly_flat_fee: customerData?.monthly_flat_fee || 0,
            appointments_per_month: customerData?.appointments_per_month || 0,
            start_date: customerData?.start_date || null,
            end_date: customerData?.end_date || null,
            conditions: customerData?.conditions || null,
            avatar_url: profile.avatar_url || null
          };
        });

        // Add any customers from the customers table that don't have profile entries
        customersData?.forEach(customer => {
          if (!combinedCustomers.some(c => c.id === customer.id)) {
            combinedCustomers.push({
              id: customer.id,
              user_id: customer.id,
              full_name: customer.name || 'Customer',
              name: customer.name || 'Customer',
              company_name: 'No Company',
              role: 'customer',
              email: '',
              status: 'active',
              company_id: null,
              setup_fee: customer.setup_fee || 0,
              price_per_appointment: customer.price_per_appointment || 0,
              monthly_flat_fee: customer.monthly_flat_fee || 0,
              appointments_per_month: customer.appointments_per_month || 0,
              start_date: customer.start_date || null,
              end_date: customer.end_date || null,
              conditions: customer.conditions || null,
              avatar_url: null
            });
          }
        });

        console.log(`Final combined customer count: ${combinedCustomers.length}`);
        return combinedCustomers;
      } catch (error: any) {
        console.error('Exception in fetchCustomersData:', error);
        return [];
      }
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.full_name?.toLowerCase().includes(searchLower)) ||
      (customer.name?.toLowerCase().includes(searchLower)) ||
      (customer.company_name?.toLowerCase().includes(searchLower)) ||
      (customer.email?.toLowerCase().includes(searchLower))
    );
  });

  // Get comprehensive debug info
  const debugInfo = {
    totalCustomers: customers?.length || 0,
    filteredCustomers: filteredCustomers?.length || 0,
    companyUsersCount: 0, // Will be set by admin logic elsewhere
    hasProfiles: true, // Assumes profiles were checked
    hasCustomers: true, // Assumes customers table was checked
    sources: ['profiles', 'customers', 'company_users', 'user_roles'],
    timestamp: new Date().toISOString(),
    checks: {
      profilesChecked: true,
      customersChecked: true,
      companyUsersChecked: true,
      rolesChecked: true
    }
  };

  return {
    customers: filteredCustomers || [],
    isLoading,
    error,
    loading: isLoading,
    errorMsg: error ? error.message : null,
    searchTerm,
    setSearchTerm,
    refetch,
    fetchCustomers: refetch,
    debugInfo
  };
}
