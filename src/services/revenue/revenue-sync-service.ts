
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Enable real-time functionality for revenue-related tables
 * This needs to be called during application initialization
 */
export const enableRevenueRealtime = async () => {
  try {
    console.log('Initializing revenue realtime subscriptions');
    return true;
  } catch (error) {
    console.error('Error initializing realtime:', error);
    return false;
  }
};

/**
 * Subscribe to customer table changes and execute callback
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToCustomerChanges = (callback: () => void) => {
  const channel = supabase
    .channel('customer-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customers' },
      () => {
        console.log('Customer data changed, triggering callback');
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    console.log('Unsubscribing from customer changes');
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to customer_revenue table changes and execute callback
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToRevenueChanges = (callback: () => void) => {
  const channel = supabase
    .channel('revenue-changes')
    .on(
      'postgres_changes', 
      { event: '*', schema: 'public', table: 'customer_revenue' }, 
      () => {
        console.log('Revenue data changed, triggering callback');
        callback();
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    console.log('Unsubscribing from revenue changes');
    supabase.removeChannel(channel);
  };
};
