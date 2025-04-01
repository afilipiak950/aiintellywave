
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export interface KpiMetric {
  id: string;
  name: string;
  value: number;
  previous_value: number;
  updated_at: string;
}

export const useKpiMetrics = () => {
  const [metrics, setMetrics] = useState<Record<string, KpiMetric | null>>({});
  const [loading, setLoading] = useState(false);
  // Use a ref to track if we're currently fetching, to prevent duplicate requests
  const isFetchingRef = useRef(false);
  // Track errors separately, don't re-render on errors
  const errorRef = useRef<Error | null>(null);
  
  const fetchMetrics = useCallback(async (metricNames: string[]) => {
    // Prevent concurrent fetches and re-fetch loops
    if (isFetchingRef.current) {
      console.log('Already fetching KPI metrics, skipping duplicate call');
      return metrics;
    }
    
    try {
      isFetchingRef.current = true;
      setLoading(true);
      errorRef.current = null;
      
      // Use a timeout to cancel the request if it takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('KPI metrics request timed out')), 10000);
      });
      
      // Create the data fetch promise
      const fetchPromise = supabase
        .from('kpi_metrics')
        .select('*')
        .in('name', metricNames);
      
      // Race the two promises
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => { throw new Error('Fetch timeout'); })
      ]) as any;
        
      if (error) {
        throw error;
      }
      
      // Convert array to record object with name as key
      const metricsRecord: Record<string, KpiMetric | null> = {};
      
      if (data && Array.isArray(data)) {
        data.forEach((metric) => {
          if (metric && metric.name) {
            metricsRecord[metric.name] = metric;
          }
        });
      }
      
      // Fill in any missing metrics with null
      metricNames.forEach(name => {
        if (!metricsRecord[name]) metricsRecord[name] = null;
      });
      
      setMetrics(metricsRecord);
      return metricsRecord;
      
    } catch (error: any) {
      console.error('Error fetching KPI metrics:', error);
      errorRef.current = error;
      
      // Only show toast once, not on every failed re-render
      if (!errorRef.current) {
        toast({
          title: "Error",
          description: "Failed to load KPI metrics",
          variant: "destructive"
        });
      }
      
      return metrics; // Return current state on error
    } finally {
      setLoading(false);
      // Allow future fetch attempts
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 1000); // Prevent rapid refetching by adding a cooldown
    }
  }, []); // Remove metrics from dependency to prevent loops
  
  const updateMetric = useCallback(async (name: string, value: number) => {
    try {
      const currentMetric = metrics[name];
      
      let result;
      
      // If the metric already exists, update it
      if (currentMetric) {
        const { data, error } = await supabase
          .from('kpi_metrics')
          .update({
            previous_value: currentMetric.value,
            value,
            updated_at: new Date().toISOString()
          })
          .eq('name', name)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } 
      // Otherwise, create a new metric
      else {
        const { data, error } = await supabase
          .from('kpi_metrics')
          .insert({
            name,
            value,
            previous_value: 0,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Update local state
      setMetrics(prev => ({
        ...prev,
        [name]: result
      }));
      
      return result;
    } catch (error: any) {
      console.error('Error updating KPI metric:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [metrics]);
  
  // Helper to calculate growth percentage
  const calculateGrowth = useCallback((current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  }, []);
  
  return {
    metrics,
    loading,
    fetchMetrics,
    updateMetric,
    calculateGrowth
  };
};
