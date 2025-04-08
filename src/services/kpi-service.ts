
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  leadsCount: number;
  activeProjects: number;
  conversionRate: { value: number; previousValue: number } | null;
  bookingCandidates: { value: number; previousValue: number } | null;
}

interface KpiMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  updated_at: string;
}

// Add cache to prevent excessive server requests
const statsCache = {
  data: null as DashboardStats | null,
  timestamp: 0,
  validFor: 60000, // Cache valid for 1 minute
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Check if we have valid cached data
  const now = Date.now();
  if (statsCache.data && (now - statsCache.timestamp) < statsCache.validFor) {
    console.log('Returning cached dashboard stats');
    return statsCache.data;
  }
  
  try {
    console.log('Fetching fresh dashboard stats');
    
    // Fetch leads count
    const { count: leadsCount, error: leadsError } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true });
      
    if (leadsError) throw leadsError;
    
    // Fetch active projects
    const { count: activeProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'in_progress');
      
    if (projectsError) throw projectsError;
    
    // Get conversion rate and booking candidates from kpi_metrics
    let conversionRate = null;
    let bookingCandidates = null;
    
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_metrics')
      .select('*')
      .in('name', ['conversion_rate', 'booking_candidates']);
      
    if (!kpiError && kpiData) {
      for (const metric of kpiData) {
        if (metric.name === 'conversion_rate') {
          conversionRate = {
            value: metric.value || 0,
            previousValue: metric.previous_value || 0
          };
        } else if (metric.name === 'booking_candidates') {
          bookingCandidates = {
            value: metric.value || 0,
            previousValue: metric.previous_value || 0
          };
        }
      }
    }
    
    const stats: DashboardStats = {
      leadsCount: leadsCount || 0,
      activeProjects: activeProjects || 0,
      conversionRate: conversionRate || { value: 0, previousValue: 0 },
      bookingCandidates: bookingCandidates || { value: 0, previousValue: 0 }
    };
    
    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;
    
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return default values on error
    const defaultStats: DashboardStats = {
      leadsCount: 0,
      activeProjects: 0,
      conversionRate: { value: 0, previousValue: 0 },
      bookingCandidates: { value: 0, previousValue: 0 }
    };
    
    return defaultStats;
  }
};

// Function to handle KPI metric updates with retry logic
export const updateKpiMetric = async (name: string, value: number): Promise<boolean> => {
  const maxRetries = 2;
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      attempts++;
      
      // Check if the metric already exists
      const { data: existingMetric } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('name', name)
        .maybeSingle();
      
      if (existingMetric) {
        // Update existing metric
        const { error } = await supabase
          .from('kpi_metrics')
          .update({ 
            previous_value: (existingMetric as unknown as KpiMetric).value,
            value: value,
            updated_at: new Date().toISOString()
          })
          .eq('name', name);
          
        if (error) throw error;
      } else {
        // Create new metric
        const { error } = await supabase
          .from('kpi_metrics')
          .insert({
            name,
            value,
            previous_value: 0,
            updated_at: new Date().toISOString()
          });
          
        if (error) throw error;
      }
      
      // Clear cache to force fresh data on next fetch
      statsCache.data = null;
      
      return true;
    } catch (error) {
      console.error(`Error updating KPI metric "${name}" (Attempt ${attempts}):`, error);
      
      if (attempts > maxRetries) {
        return false; // Give up after max retries
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  return false; // Should never reach here due to the return in the catch block
};

// Enable real-time updates for KPI metrics and dashboard stats
export const enableRealtimeUpdates = (): (() => void) => {
  // Set up subscription for leads table changes
  const leadsChannel = supabase.channel('public:leads-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => {
        console.log('Leads table changed:', payload);
        // Clear cache to force fresh data on next fetch
        statsCache.data = null;
        // Dispatch an event that components can listen to
        window.dispatchEvent(new CustomEvent('dashboard-stats-updated'));
      }
    )
    .subscribe();
    
  // Set up subscription for projects table changes
  const projectsChannel = supabase.channel('public:projects-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' },
      (payload) => {
        console.log('Projects table changed:', payload);
        // Clear cache to force fresh data on next fetch
        statsCache.data = null;
        // Dispatch an event that components can listen to
        window.dispatchEvent(new CustomEvent('dashboard-stats-updated'));
      }
    )
    .subscribe();
    
  // Set up subscription for kpi_metrics table changes
  const kpiChannel = supabase.channel('public:kpi-metrics-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'kpi_metrics' },
      (payload) => {
        console.log('KPI metrics table changed:', payload);
        // Clear cache to force fresh data on next fetch
        statsCache.data = null;
        // Dispatch an event that components can listen to
        window.dispatchEvent(new CustomEvent('dashboard-stats-updated'));
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(leadsChannel);
    supabase.removeChannel(projectsChannel);
    supabase.removeChannel(kpiChannel);
  };
};

// Function to subscribe to dashboard stats updates
export const subscribeToDashboardUpdates = (callback: () => void): (() => void) => {
  const listener = () => {
    callback();
  };
  
  window.addEventListener('dashboard-stats-updated', listener);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('dashboard-stats-updated', listener);
  };
};
