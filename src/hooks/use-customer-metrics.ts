
import { useState, useEffect, useCallback } from 'react';
import { CustomerMetric } from '@/types/customer-metrics';
import { getCustomerMetrics } from '@/services/customer-metrics-service';

export const useCustomerMetrics = (customerId: string | undefined) => {
  const [metrics, setMetrics] = useState<CustomerMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMetrics = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      setError('No customer ID provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerMetrics(customerId);
      setMetrics(data);
    } catch (err: any) {
      console.error('Error fetching customer metrics:', err);
      setError(err.message || 'Failed to load customer metrics');
    } finally {
      setLoading(false);
    }
  }, [customerId]);
  
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
