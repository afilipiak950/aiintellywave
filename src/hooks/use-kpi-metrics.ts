import { useState } from 'react';
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
  
  const fetchMetrics = async (metricNames: string[]) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .in('name', metricNames);
        
      if (error) throw error;
      
      // Convert array to record object with name as key
      const metricsRecord: Record<string, KpiMetric | null> = {};
      data?.forEach((metric) => {
        metricsRecord[metric.name] = metric;
      });
      
      // Fill in any missing metrics with null
      metricNames.forEach(name => {
        if (!metricsRecord[name]) metricsRecord[name] = null;
      });
      
      setMetrics(metricsRecord);
      return metricsRecord;
      
    } catch (error: any) {
      console.error('Error fetching KPI metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load KPI metrics",
        variant: "destructive"
      });
      return {};
    } finally {
      setLoading(false);
    }
  };
  
  const updateMetric = async (name: string, value: number) => {
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
  };
  
  // Helper to calculate growth percentage
  const calculateGrowth = (current: number, previous: number): { value: string, isPositive: boolean } => {
    if (!previous) return { value: '0.0', isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };
  
  return {
    metrics,
    loading,
    fetchMetrics,
    updateMetric,
    calculateGrowth
  };
};
