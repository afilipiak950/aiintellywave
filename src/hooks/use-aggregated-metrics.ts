
import { useState, useEffect, useCallback } from 'react';
import { getAggregatedMetrics } from '@/services/customer-metrics-service';

interface AggregatedMetrics {
  avg_conversion_rate: number;
  total_booking_candidates: number;
  customer_count: number;
}

export const useAggregatedMetrics = () => {
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
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
