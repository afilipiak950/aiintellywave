
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
      
      console.log('Fetching KPI data, attempt:', retryCount + 1);
      
      // Fügen Sie hier Debug-Informationen hinzu
      console.log('Auth session:', await supabase.auth.getSession());
      
      // Fetch leads count - add a reasonable limit to prevent timeout
      const { count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .limit(100);  // Add limit to improve performance
        
      if (leadsError) {
        console.error('Error fetching leads count:', leadsError);
        throw leadsError;
      }
      
      console.log('Leads count fetched successfully:', leadsCount);
      
      // Fetch active projects count - add a reasonable limit
      const { count: activeProjects, error: activeProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress')
        .limit(100);  // Add limit to improve performance
        
      if (activeProjectsError) {
        console.error('Error fetching active projects count:', activeProjectsError);
        throw activeProjectsError;
      }
      
      console.log('Active projects count fetched successfully:', activeProjects);
      
      // Fetch completed projects count - add a reasonable limit
      const { count: completedProjects, error: completedProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .limit(100);  // Add limit to improve performance
        
      if (completedProjectsError) {
        console.error('Error fetching completed projects count:', completedProjectsError);
        throw completedProjectsError;
      }
      
      console.log('Completed projects count fetched successfully:', completedProjects);
      
      // Fetch users count - add a reasonable limit
      const { count: usersCount, error: usersError } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true })
        .limit(100);  // Add limit to improve performance
        
      if (usersError) {
        console.error('Error fetching users count:', usersError);
        throw usersError;
      }
      
      console.log('Users count fetched successfully:', usersCount);
      
      // Fetch system health status with better error handling
      let systemHealth = {
        percentage: '99.8%',
        message: 'All systems operational'
      };
      
      try {
        console.log('Fetching system health data...');
        // Check if system_health table exists and has data
        const { data: healthData, error: healthError } = await supabase
          .from('system_health')
          .select('health_percentage, status_message')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (healthError) {
          console.warn('Error fetching system health:', healthError);
        } else if (healthData) {
          console.log('System health data fetched successfully:', healthData);
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
      setError(null);
      
      console.log('KPI data fetch completed successfully');
      
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
          onClick: () => {
            console.log('Retry button clicked in toast');
            refreshData();
          }
        }
      });
    } finally {
      setLoading(false);
    }
  }, [maxRetries, retryDelay, retryCount]);
  
  useEffect(() => {
    // Initial fetch
    console.log('Initial KPI data fetch');
    fetchKpiData();
    
    // Enable real-time updates
    const unsubscribeRealtime = enableRealtimeUpdates();
    console.log('Real-time updates enabled');
    
    // Subscribe to dashboard updates
    const unsubscribeDashboard = subscribeToDashboardUpdates(() => {
      console.log('Dashboard update received, refreshing data');
      fetchKpiData();
    });
    console.log('Dashboard updates subscription enabled');
    
    // Set up interval refresh as a fallback
    const intervalId = setInterval(() => {
      console.log('Interval refresh triggered');
      fetchKpiData();
    }, refreshInterval);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      unsubscribeRealtime();
      unsubscribeDashboard();
      console.log('KPI data hooks and subscriptions cleaned up');
    };
  }, [fetchKpiData, refreshInterval]);
  
  const refreshData = useCallback(() => {
    console.log('Manual refresh triggered');
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
