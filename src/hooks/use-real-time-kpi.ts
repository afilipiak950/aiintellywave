
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeUpdates, subscribeToDashboardUpdates } from '@/services/kpi-service';
import { toast } from '@/hooks/use-toast';

interface RealTimeKpiOptions {
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
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
  const { 
    refreshInterval = 60000, 
    maxRetries = 3,
    retryDelay = 2000 
  } = options;
  
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
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchKpiData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
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
      
      // Fetch system health status - check if table exists first
      let systemHealth = {
        percentage: '99.8%',
        message: 'All systems operational'
      };
      
      try {
        // Check if system_health table exists and has data
        const { data: healthData, error: healthError } = await supabase
          .from('system_health')
          .select('health_percentage, status_message')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!healthError && healthData) {
          // Format the health percentage to include the % symbol
          const healthPercentage = healthData.health_percentage !== null && healthData.health_percentage !== undefined
            ? (typeof healthData.health_percentage === 'number'
                ? `${healthData.health_percentage.toFixed(1)}%`
                : `${healthData.health_percentage}%`)
            : '99.8%';
            
          systemHealth = {
            percentage: healthPercentage,
            message: healthData.status_message || 'All systems operational'
          };
        }
      } catch (healthErr) {
        console.warn('Could not fetch system health status, using default values', healthErr);
        // Using default values defined above
      }
      
      // Reset retry count on successful data fetch
      setRetryCount(0);
      
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
      
      // Implement retry logic
      if (retryCount < maxRetries) {
        console.log(`Retry attempt ${retryCount + 1} of ${maxRetries} in ${retryDelay}ms`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchKpiData(true), retryDelay);
        return;
      }
      
      setError(error.message || 'Failed to fetch KPI data');
      
      // Create a toast without JSX
      toast({
        title: "Error loading statistics",
        description: "Could not load real-time data. Using cached values instead.",
        variant: "destructive",
        // Instead of using a JSX button, we define an action object
        // that will be handled by the toast component
        action: {
          label: "Retry",
          onClick: () => refreshData()
        }
      });
    } finally {
      setLoading(false);
    }
  }, [maxRetries, retryDelay, retryCount]);
  
  useEffect(() => {
    // Initial fetch
    fetchKpiData();
    
    // Enable real-time updates
    const unsubscribeRealtime = enableRealtimeUpdates();
    
    // Subscribe to dashboard updates
    const unsubscribeDashboard = subscribeToDashboardUpdates(fetchKpiData);
    
    // Set up interval refresh as a fallback
    const intervalId = setInterval(() => fetchKpiData(), refreshInterval);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      unsubscribeRealtime();
      unsubscribeDashboard();
    };
  }, [fetchKpiData, refreshInterval]);
  
  const refreshData = useCallback(() => {
    setRetryCount(0); // Reset retry count on manual refresh
    return fetchKpiData();
  }, [fetchKpiData]);
  
  return {
    kpiData,
    loading,
    error,
    lastUpdated,
    refreshData
  };
};
