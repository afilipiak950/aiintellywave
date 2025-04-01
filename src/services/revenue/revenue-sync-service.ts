
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Track active subscriptions to prevent duplicate subscriptions
const activeSubscriptions = {
  customer: null,
  revenue: null
};

// Debounce mechanism to prevent rapid successive updates
let lastUpdateTimestamp = 0;
const DEBOUNCE_THRESHOLD = 2000; // 2 seconds minimum between updates

/**
 * Enable real-time functionality for revenue-related tables
 * This needs to be called during application initialization
 */
export const enableRevenueRealtime = async () => {
  try {
    console.log('Initializing revenue realtime subscriptions');
    
    // Insert real-time table setup if needed
    // For Supabase, tables are realtime by default, so this is now just a check
    const { data, error } = await supabase.from('customers').select('id').limit(1);
    
    if (error) {
      console.error('Error checking customer table access:', error);
      return false;
    }
    
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
  // If there's already an active subscription, remove it
  if (activeSubscriptions.customer) {
    supabase.removeChannel(activeSubscriptions.customer);
    activeSubscriptions.customer = null;
  }

  // Create new subscription
  const channel = supabase
    .channel('customer-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customers' },
      (payload) => {
        console.log('Customer data changed, type:', payload.eventType);
        
        // Implement proper debouncing to prevent rapid consecutive executions
        const now = Date.now();
        if (now - lastUpdateTimestamp < DEBOUNCE_THRESHOLD) {
          console.log('Debouncing customer update - too soon after last update');
          return;
        }
        
        lastUpdateTimestamp = now;
        
        // Clear any pending timeout
        if (window.customerChangeTimeout) {
          clearTimeout(window.customerChangeTimeout);
        }
        
        // Set a new timeout
        window.customerChangeTimeout = setTimeout(() => {
          callback();
        }, 500) as unknown as number;
      }
    )
    .subscribe((status) => {
      console.log('Customer subscription status:', status);
    });

  activeSubscriptions.customer = channel;

  // Return cleanup function
  return () => {
    console.log('Unsubscribing from customer changes');
    if (activeSubscriptions.customer === channel) {
      supabase.removeChannel(channel);
      activeSubscriptions.customer = null;
    }
    
    // Also clear any pending timeouts
    if (window.customerChangeTimeout) {
      clearTimeout(window.customerChangeTimeout);
      window.customerChangeTimeout = undefined;
    }
  };
};

/**
 * Subscribe to customer_revenue table changes and execute callback
 * @returns Cleanup function to unsubscribe
 */
export const subscribeToRevenueChanges = (callback: () => void) => {
  // If there's already an active subscription, remove it
  if (activeSubscriptions.revenue) {
    supabase.removeChannel(activeSubscriptions.revenue);
    activeSubscriptions.revenue = null;
  }

  // Create new subscription
  const channel = supabase
    .channel('revenue-changes')
    .on(
      'postgres_changes', 
      { event: '*', schema: 'public', table: 'customer_revenue' }, 
      (payload) => {
        console.log('Revenue data changed, type:', payload.eventType);
        
        // Implement proper debouncing to prevent rapid consecutive executions
        const now = Date.now();
        if (now - lastUpdateTimestamp < DEBOUNCE_THRESHOLD) {
          console.log('Debouncing revenue update - too soon after last update');
          return;
        }
        
        lastUpdateTimestamp = now;
        
        // Clear any pending timeout
        if (window.revenueChangeTimeout) {
          clearTimeout(window.revenueChangeTimeout);
        }
        
        // Set a new timeout
        window.revenueChangeTimeout = setTimeout(() => {
          callback();
        }, 500) as unknown as number;
      }
    )
    .subscribe((status) => {
      console.log('Revenue subscription status:', status);
    });

  activeSubscriptions.revenue = channel;

  // Return cleanup function
  return () => {
    console.log('Unsubscribing from revenue changes');
    if (activeSubscriptions.revenue === channel) {
      supabase.removeChannel(channel);
      activeSubscriptions.revenue = null;
    }
    
    // Also clear any pending timeouts
    if (window.revenueChangeTimeout) {
      clearTimeout(window.revenueChangeTimeout);
      window.revenueChangeTimeout = undefined;
    }
  };
};

// Add a global declaration for the timeout variables
declare global {
  interface Window {
    customerChangeTimeout: number | undefined;
    revenueChangeTimeout: number | undefined;
  }
}
