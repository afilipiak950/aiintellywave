
import { supabase } from '@/integrations/supabase/client';

/**
 * Enables real-time updates from Supabase
 * @returns A cleanup function to remove the subscription
 */
export function enableRealtimeUpdates() {
  try {
    // Subscribe to system_health table changes
    const channel = supabase.channel('system-health-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'system_health' }, 
          (payload) => {
            console.log('System health real-time update:', payload);
            // The subscriber will handle the update
          }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error enabling real-time updates:', error);
    return () => {};
  }
}

/**
 * Sets up a subscriber for dashboard updates
 * @param refreshCallback Function to call when updates are received
 * @returns A cleanup function to remove the subscription
 */
export function subscribeToDashboardUpdates(refreshCallback: () => void) {
  try {
    // Subscribe to the broadcast channel for dashboard updates
    const channel = supabase.channel('dashboard-updates')
      .on('broadcast', { event: 'dashboard-refresh' }, () => {
        console.log('Dashboard refresh event received');
        refreshCallback();
      })
      .subscribe((status) => {
        console.log('Dashboard updates subscription status:', status);
      });
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error subscribing to dashboard updates:', error);
    return () => {};
  }
}

/**
 * Broadcasts a dashboard refresh event to all clients
 */
export async function broadcastDashboardRefresh() {
  try {
    return supabase.channel('dashboard-updates').send({
      type: 'broadcast',
      event: 'dashboard-refresh',
      payload: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error broadcasting dashboard refresh:', error);
  }
}

/**
 * Updates a KPI metric in the database
 * @param metricName The name of the metric to update
 * @param newValue The new value for the metric
 * @returns Boolean indicating success/failure
 */
export async function updateKpiMetric(metricName: string, newValue: number): Promise<boolean> {
  try {
    console.log(`Updating KPI metric: ${metricName} to ${newValue}`);
    
    // First check if the metric exists
    const { data: existingMetric, error: fetchError } = await supabase
      .from('kpi_metrics')
      .select('*')
      .eq('name', metricName)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching KPI metric:', fetchError);
      return false;
    }
    
    if (existingMetric) {
      // Update existing metric
      const { error: updateError } = await supabase
        .from('kpi_metrics')
        .update({ 
          previous_value: existingMetric.value,
          value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMetric.id);
      
      if (updateError) {
        console.error('Error updating KPI metric:', updateError);
        return false;
      }
    } else {
      // Create new metric
      const { error: insertError } = await supabase
        .from('kpi_metrics')
        .insert({
          name: metricName,
          value: newValue,
          previous_value: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating KPI metric:', insertError);
        return false;
      }
    }
    
    // Broadcast update to all clients
    await broadcastDashboardRefresh();
    return true;
  } catch (error) {
    console.error('Exception in updateKpiMetric:', error);
    return false;
  }
}

// Mock KPI data for reliable fallback
export const getDefaultKpiData = () => ({
  leadsCount: 157,
  activeProjects: 11,
  completedProjects: 24,
  usersCount: 18,
  systemHealth: {
    percentage: '99.8%',
    message: 'All systems operational'
  }
});
