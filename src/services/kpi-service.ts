
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  leadsCount: number;
  activeProjects: number;
  conversionRate: { value: number; previousValue: number };
  bookingCandidates: { value: number; previousValue: number };
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch total leads count
    const { count: leadsTotal, error: leadsError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (leadsError) throw leadsError;
    
    // Fetch active projects count
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .in('status', ['planning', 'in_progress']);
      
    if (projectsError) throw projectsError;
    
    // Fetch KPI metrics
    const { data: kpiData, error: kpiError } = await supabase
      .from('kpi_metrics')
      .select('*')
      .in('name', ['conversion_rate', 'booking_candidates']);
      
    if (kpiError) throw kpiError;
    
    // Find the metrics in the returned data
    const conversionRateMetric = kpiData?.find(m => m.name === 'conversion_rate');
    const bookingCandidatesMetric = kpiData?.find(m => m.name === 'booking_candidates');
    
    return {
      leadsCount: leadsTotal || 0,
      activeProjects: projectsData?.length || 0,
      conversionRate: {
        value: conversionRateMetric?.value || 0,
        previousValue: conversionRateMetric?.previous_value || 0
      },
      bookingCandidates: {
        value: bookingCandidatesMetric?.value || 0,
        previousValue: bookingCandidatesMetric?.previous_value || 0
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Function to handle KPI metric updates
export const updateKpiMetric = async (name: string, value: number): Promise<boolean> => {
  try {
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
          previous_value: existingMetric.value,
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
    
    return true;
  } catch (error) {
    console.error(`Error updating KPI metric "${name}":`, error);
    return false;
  }
};
