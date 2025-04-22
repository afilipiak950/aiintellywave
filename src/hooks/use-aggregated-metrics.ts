
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AggregatedMetricsData {
  avg_conversion_rate: number;
  total_booking_candidates: number;
  customer_count: number;
}

export const useAggregatedMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use direct SQL query instead of the DB function to avoid type casting issues
      const { data, error } = await supabase
        .from('customer_metrics')
        .select(`
          conversion_rate,
          booking_candidates
        `);
      
      if (error) throw error;
      
      // Manually calculate the metrics
      const avgConversionRate = data.length > 0
        ? data.reduce((sum, item) => sum + (item.conversion_rate || 0), 0) / data.length
        : 0;
      
      const totalBookingCandidates = data.reduce((sum, item) => sum + (item.booking_candidates || 0), 0);
      
      const aggregatedData: AggregatedMetricsData = {
        avg_conversion_rate: avgConversionRate,
        total_booking_candidates: totalBookingCandidates,
        customer_count: data.length
      };
      
      setMetrics(aggregatedData);
    } catch (err: any) {
      console.error('Error fetching aggregated metrics:', err);
      setError(err.message || 'Failed to load aggregated metrics');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  
  return {
    metrics,
    loading,
    error,
    refetchMetrics: fetchMetrics
  };
};
