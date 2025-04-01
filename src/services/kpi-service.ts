
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
  if (statsCache.data && now - statsCache.timestamp < statsCache.validFor) {
    return statsCache.data;
  }
  
  try {
    // Define default return structure
    const stats: DashboardStats = {
      leadsCount: 0,
      activeProjects: 0,
      conversionRate: null,
      bookingCandidates: null
    };
    
    // Use Promise.all to fetch data in parallel
    const [leadsResult, projectsResult, kpiResult] = await Promise.all([
      // Fetch total leads count
      supabase.from('leads').select('*', { count: 'exact', head: true }),
      
      // Fetch active projects count
      supabase.from('projects')
        .select('id')
        .in('status', ['planning', 'in_progress']),
        
      // Fetch KPI metrics
      supabase.from('kpi_metrics')
        .select('*')
        .in('name', ['conversion_rate', 'booking_candidates'])
    ]);
    
    // Process leads count
    if (!leadsResult.error) {
      stats.leadsCount = leadsResult.count || 0;
    }
    
    // Process projects count
    if (!projectsResult.error && projectsResult.data) {
      stats.activeProjects = projectsResult.data.length;
    }
    
    // Process KPI metrics
    if (!kpiResult.error && kpiResult.data) {
      // Find the metrics in the returned data
      const conversionRateMetric = kpiResult.data.find(m => m.name === 'conversion_rate') as KpiMetric | undefined;
      const bookingCandidatesMetric = kpiResult.data.find(m => m.name === 'booking_candidates') as KpiMetric | undefined;
      
      if (conversionRateMetric) {
        stats.conversionRate = {
          value: conversionRateMetric.value,
          previousValue: conversionRateMetric.previous_value
        };
      }
      
      if (bookingCandidatesMetric) {
        stats.bookingCandidates = {
          value: bookingCandidatesMetric.value,
          previousValue: bookingCandidatesMetric.previous_value
        };
      }
    }
    
    // Update cache
    statsCache.data = stats;
    statsCache.timestamp = now;
    
    return stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default data structure on error instead of throwing
    return {
      leadsCount: 0,
      activeProjects: 0,
      conversionRate: null,
      bookingCandidates: null
    };
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
