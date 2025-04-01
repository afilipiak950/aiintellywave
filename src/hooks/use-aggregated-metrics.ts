
import { useState, useEffect, useCallback } from 'react';
import { getAggregatedMetrics, AggregatedMetricsData } from '@/services/customer-metrics-service';

export const useAggregatedMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAggregatedMetrics();
      setMetrics(data);
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
