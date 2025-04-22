
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
        console.log('Fetching customers data directly from customers table...');

        const { data, error } = await supabase
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

        if (error) {
          console.error('Error fetching customers:', error);
          throw error;
        }

        console.log(`Found ${data.length} customer records`);

        // Transform data to match expected UserData interface
        const formattedCustomers = data.map(customer => ({
          id: customer.id,
          user_id: customer.id,
          full_name: customer.name,
          name: customer.name,
          company_name: customer.name, // Fallback
          role: 'customer',
          email: '', // No email in customers table
          status: 'active',
          company_id: customer.id,
          setup_fee: customer.setup_fee,
          price_per_appointment: customer.price_per_appointment,
          monthly_flat_fee: customer.monthly_flat_fee,
          appointments_per_month: customer.appointments_per_month,
          start_date: customer.start_date,
          end_date: customer.end_date,
          conditions: customer.conditions
        }));

        return formattedCustomers;
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
      (customer.company_name?.toLowerCase().includes(searchLower))
    );
  });

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
    debugInfo: undefined
  };
}
