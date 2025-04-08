
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeUpdates, subscribeToDashboardUpdates } from '@/services/kpi-service';

interface RealTimeKpiOptions {
  refreshInterval?: number;
}

interface KpiData {
  leadsCount: number;
  activeProjects: number;
  completedProjects: number;
  usersCount: number;
  systemHealth: {
    percentage: string;
    message: string;
  };
  // Add any other KPIs needed
}

export const useRealTimeKpi = (options: RealTimeKpiOptions = {}) => {
  const { refreshInterval = 60000 } = options; // Default refresh every minute
  const [kpiData, setKpiData] = useState<KpiData>({
    leadsCount: 0,
    activeProjects: 0,
    completedProjects: 0,
    usersCount: 0,
    systemHealth: {
      percentage: '99.8%',
      message: 'All systems operational'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const fetchKpiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leads count
      const { count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
        
      if (leadsError) throw leadsError;
      
      // Fetch active projects count
      const { count: activeProjects, error: activeProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress');
        
      if (activeProjectsError) throw activeProjectsError;
      
      // Fetch completed projects count
      const { count: completedProjects, error: completedProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
        
      if (completedProjectsError) throw completedProjectsError;
      
      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true });
        
      if (usersError) throw usersError;
      
      // Fetch system health status (simplified)
      // In a real system, this could come from a health check service
      const systemHealth = {
        percentage: '99.8%',
        message: 'All systems operational'
      };
      
      setKpiData({
        leadsCount: leadsCount || 0,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        usersCount: usersCount || 0,
        systemHealth
      });
      
      setLastUpdated(new Date());
      
    } catch (error: any) {
      console.error('Error fetching KPI data:', error);
      setError(error.message || 'Failed to fetch KPI data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial fetch
    fetchKpiData();
    
    // Enable real-time updates
    const unsubscribeRealtime = enableRealtimeUpdates();
    
    // Subscribe to dashboard updates
    const unsubscribeDashboard = subscribeToDashboardUpdates(fetchKpiData);
    
    // Set up interval refresh as a fallback
    const intervalId = setInterval(fetchKpiData, refreshInterval);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      unsubscribeRealtime();
      unsubscribeDashboard();
    };
  }, [refreshInterval]);
  
  const refreshData = () => {
    fetchKpiData();
  };
  
  return {
    kpiData,
    loading,
    error,
    lastUpdated,
    refreshData
  };
};
