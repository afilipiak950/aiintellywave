
import { useState, useEffect, useCallback } from 'react';
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';
import { getRevenueMetrics, getCustomerRevenueByPeriod, upsertCustomerRevenue } from '@/services/revenue-service';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for fetching and managing revenue data
 */
export const useRevenueData = (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
  currentYear: number,
  currentMonth: number
) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<CustomerRevenue[]>([]);
  
  // Extract the loading logic into a separate function so we can call it for refresh
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load metrics for the current month
      const metricsData = await getRevenueMetrics(currentYear, currentMonth);
      setMetrics(metricsData);
      
      // Load revenue data for the selected period range
      const revenueData = await getCustomerRevenueByPeriod(
        startYear, 
        startMonth, 
        endYear, 
        endMonth
      );
      
      setRevenueData(revenueData);
    } catch (error) {
      console.error('Error loading revenue dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [startYear, startMonth, endYear, endMonth, currentYear, currentMonth]);
  
  // Load data when periods change
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Create a function to manually refresh data
  const refreshData = () => {
    loadData();
  };
  
  // Handle updating a cell in the table
  const updateRevenueCell = async (data: CustomerRevenue) => {
    try {
      const result = await upsertCustomerRevenue(data);
      
      if (result) {
        // Refresh data after update
        await loadData();
        
        toast({
          title: 'Success',
          description: 'Revenue data updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating revenue cell:', error);
      toast({
        title: 'Error',
        description: 'Failed to update revenue data',
        variant: 'destructive'
      });
    }
  };

  return {
    loading,
    metrics,
    revenueData,
    updateRevenueCell,
    refreshData
  };
};
