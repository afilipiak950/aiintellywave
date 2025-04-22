
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { enableRealtimeUpdates, subscribeToDashboardUpdates, getDefaultKpiData } from '@/services/kpi-service';
import { toast } from '@/hooks/use-toast';

interface RealTimeKpiOptions {
  refreshInterval?: number;
  maxRetries?: number;
  retryDelay?: number;
  cacheDuration?: number;
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
}

export const useRealTimeKpi = (options: RealTimeKpiOptions = {}) => {
  const { 
    refreshInterval = 60000, 
    maxRetries = 3,
    retryDelay = 2000,
    cacheDuration = 300000 // 5 minutes cache
  } = options;
  
  const [kpiData, setKpiData] = useState<KpiData>(getDefaultKpiData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  
  const isFetchingRef = useRef(false);
  const lastSuccessfulFetchRef = useRef<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const fetchKpiData = useCallback(async (isRetry = false) => {
    if (isFetchingRef.current) {
      console.log('Already fetching KPI data, skipping duplicate request');
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      isFetchingRef.current = true;
      
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }
      
      console.log('Fetching KPI data, attempt:', retryCount + 1);
      
      const now = new Date();
      if (
        error && 
        lastSuccessfulFetchRef.current && 
        (now.getTime() - lastSuccessfulFetchRef.current.getTime() < cacheDuration)
      ) {
        console.log('Using cached KPI data due to error and recent successful fetch');
        setError(null);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      
      // Fetch leads count with abort signal and limit
      const { count: leadsCount, error: leadsError } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .limit(1)
        .abortSignal(abortControllerRef.current.signal);
        
      if (leadsError) {
        console.error('Error fetching leads count:', leadsError);
        throw leadsError;
      }
      
      console.log('Leads count fetched successfully:', leadsCount);
      
      // Fetch active projects with abort signal and limit
      const { count: activeProjects, error: activeProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_progress')
        .limit(1)
        .abortSignal(abortControllerRef.current.signal);
        
      if (activeProjectsError) {
        console.error('Error fetching active projects count:', activeProjectsError);
        throw activeProjectsError;
      }
      
      console.log('Active projects count fetched successfully:', activeProjects);
      
      // Fetch completed projects with abort signal and limit
      const { count: completedProjects, error: completedProjectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .limit(1)
        .abortSignal(abortControllerRef.current.signal);
        
      if (completedProjectsError) {
        console.error('Error fetching completed projects count:', completedProjectsError);
        throw completedProjectsError;
      }
      
      console.log('Completed projects count fetched successfully:', completedProjects);
      
      // Fetch users count with abort signal and limit
      const { count: usersCount, error: usersError } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true })
        .limit(1)
        .abortSignal(abortControllerRef.current.signal);
        
      if (usersError) {
        console.error('Error fetching users count:', usersError);
        throw usersError;
      }
      
      console.log('Users count fetched successfully:', usersCount);
      
      // Default system health values
      let systemHealth = {
        percentage: '99.8%',
        message: 'All systems operational'
      };
      
      try {
        console.log('Fetching system health data...');
        // Note: Fixed the abortSignal usage here
        const { data: healthData, error: healthError } = await supabase
          .from('system_health')
          .select('health_percentage, status_message')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (healthError) {
          console.warn('Error fetching system health:', healthError);
        } else if (healthData) {
          console.log('System health data fetched successfully:', healthData);
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
      }
      
      setRetryCount(0);
      
      const newKpiData = {
        leadsCount: leadsCount || 0,
        activeProjects: activeProjects || 0,
        completedProjects: completedProjects || 0,
        usersCount: usersCount || 0,
        systemHealth
      };
      
      setKpiData(newKpiData);
      setLastUpdated(new Date());
      setError(null);
      lastSuccessfulFetchRef.current = new Date();
      
      console.log('KPI data fetch completed successfully', newKpiData);
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching KPI data:', error);
        
        if (retryCount < maxRetries) {
          console.log(`Retry attempt ${retryCount + 1} of ${maxRetries} in ${retryDelay}ms`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchKpiData(true), retryDelay);
          return;
        }
        
        setError(error.message || 'Failed to fetch KPI data');
        
        toast({
          title: "Error loading statistics",
          description: "Could not load real-time data. Using cached values instead.",
          variant: "destructive",
          action: {
            label: "Retry",
            onClick: () => {
              console.log('Retry button clicked in toast');
              setRetryCount(0);
              refreshData();
            }
          }
        });
      } else {
        console.log('KPI data fetch was aborted');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      abortControllerRef.current = null;
    }
  }, [maxRetries, retryDelay, retryCount, error, cacheDuration]);
  
  const refreshData = useCallback(() => {
    console.log('Manual refresh triggered');
    setRetryCount(0);
    return fetchKpiData();
  }, [fetchKpiData]);
  
  useEffect(() => {
    console.log('Initial KPI data fetch');
    fetchKpiData();
    
    const unsubscribeRealtime = enableRealtimeUpdates();
    console.log('Real-time updates enabled');
    
    const unsubscribeDashboard = subscribeToDashboardUpdates(() => {
      console.log('Dashboard update received, refreshing data');
      fetchKpiData();
    });
    console.log('Dashboard updates subscription enabled');
    
    const intervalId = setInterval(() => {
      if (!error) {
        console.log('Interval refresh triggered');
        fetchKpiData();
      }
    }, refreshInterval);
    
    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      unsubscribeRealtime();
      unsubscribeDashboard();
      console.log('KPI data hooks and subscriptions cleaned up');
    };
  }, [fetchKpiData, refreshInterval, error]);
  
  return {
    kpiData,
    loading,
    error,
    lastUpdated,
    refreshData
  };
};
