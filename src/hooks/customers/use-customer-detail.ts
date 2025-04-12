
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
    
    // If we didn't find a customer in the customers table, throw an error
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
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(customersChannel);
    };
  }, [customerId, queryClient]);
  
  return null;
};
