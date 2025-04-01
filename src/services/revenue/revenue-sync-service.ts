
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Sync customers table data to revenue table for a specific year/month
 */
export const syncCustomersToRevenue = async (
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1
): Promise<boolean> => {
  try {
    console.log(`Syncing customers to revenue table for ${month}/${year}`);
    
    // Fetch all customers from the customers table (not companies)
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');
      
    if (customersError) {
      throw customersError;
    }
    
    if (!customers || customers.length === 0) {
      console.log('No customers found to sync');
      return false;
    }
    
    console.log(`Found ${customers.length} customers to sync`);
    
    // Prepare batch data for the customer revenue table
    const batch = customers.map(customer => ({
      customer_id: customer.id,
      year: year,
      month: month,
      // Only include setup fee for new customers or first month
      setup_fee: month === 1 ? (customer.setup_fee || 0) : 0,
      price_per_appointment: customer.price_per_appointment || 0,
      appointments_delivered: customer.appointments_per_month || 0,
      recurring_fee: customer.monthly_flat_fee || 0,
      updated_at: new Date().toISOString()
    }));
    
    // Upsert the data to ensure existing entries are updated
    const { error } = await supabase
      .from('customer_revenue')
      .upsert(batch, {
        onConflict: 'customer_id,year,month',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error('Error syncing customers to revenue:', error);
      throw error;
    }
    
    console.log('Successfully synced customers to revenue table');
    return true;
  } catch (error) {
    console.error('Error in syncCustomersToRevenue:', error);
    return false;
  }
};

/**
 * Enable real-time subscriptions for revenue-related tables
 */
export const enableRevenueRealtime = async (): Promise<boolean> => {
  try {
    // Setup subscriptions for both customers and customer_revenue tables
    supabase
      .channel('customer-revenue-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customer_revenue' },
        (payload) => {
          console.log('Customer revenue table changed:', payload);
          // This will trigger any UI updates via the Data hook
          window.dispatchEvent(new CustomEvent('customer-revenue-updated'));
        }
      )
      .subscribe();
      
    supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customers table changed:', payload);
          // This will trigger any UI updates
          window.dispatchEvent(new CustomEvent('customers-updated'));
        }
      )
      .subscribe();
      
    return true;
  } catch (error) {
    console.error('Error enabling revenue realtime:', error);
    return false;
  }
};

/**
 * Subscribe to changes in the customer table
 */
export const subscribeToCustomerChanges = (callback: () => void): () => void => {
  const listener = () => {
    callback();
  };
  
  window.addEventListener('customers-updated', listener);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('customers-updated', listener);
  };
};

/**
 * Subscribe to changes in the customer_revenue table
 */
export const subscribeToRevenueChanges = (callback: () => void): () => void => {
  const listener = () => {
    callback();
  };
  
  window.addEventListener('customer-revenue-updated', listener);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('customer-revenue-updated', listener);
  };
};
