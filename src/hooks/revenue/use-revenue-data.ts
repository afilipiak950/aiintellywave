
import { useState, useEffect } from 'react';
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
  
  // Load data when periods change
  useEffect(() => {
    const loadData = async () => {
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
    };
    
    loadData();
  }, [startYear, startMonth, endYear, endMonth, currentYear, currentMonth]);
  
  // Handle updating a cell in the table
  const updateRevenueCell = async (data: CustomerRevenue) => {
    try {
      const result = await upsertCustomerRevenue(data);
      
      if (result) {
        // Refresh data after update
        const updatedData = await getCustomerRevenueByPeriod(
          startYear, 
          startMonth, 
          endYear, 
          endMonth
        );
        setRevenueData(updatedData);
        
        // Also update metrics if current month was affected
        if (data.year === currentYear && data.month === currentMonth) {
          const metricsData = await getRevenueMetrics(currentYear, currentMonth);
          setMetrics(metricsData);
        }
        
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
    updateRevenueCell
  };
};
