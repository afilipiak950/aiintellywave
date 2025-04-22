
import { supabase } from '@/integrations/supabase/client';

/**
 * Enables real-time updates from Supabase
 * @returns A cleanup function to remove the subscription
 */
export function enableRealtimeUpdates() {
  // Subscribe to system_health table changes
  const channel = supabase.channel('system-health-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_health' }, 
        (payload) => {
          console.log('System health real-time update:', payload);
          // The subscriber will handle the update
        }
    )
    .subscribe();
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Sets up a subscriber for dashboard updates
 * @param refreshCallback Function to call when updates are received
 * @returns A cleanup function to remove the subscription
 */
export function subscribeToDashboardUpdates(refreshCallback: () => void) {
  // Subscribe to the broadcast channel for dashboard updates
  const channel = supabase.channel('dashboard-updates')
    .on('broadcast', { event: 'dashboard-refresh' }, () => {
      console.log('Dashboard refresh event received');
      refreshCallback();
    })
    .subscribe();
  
  // Return cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Broadcasts a dashboard refresh event to all clients
 */
export async function broadcastDashboardRefresh() {
  return supabase.channel('public').send({
    type: 'broadcast',
    event: 'dashboard-refresh',
    payload: { timestamp: new Date().toISOString() }
  });
}
