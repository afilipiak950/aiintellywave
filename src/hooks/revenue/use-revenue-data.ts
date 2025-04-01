
import { useState, useEffect, useCallback } from 'react';
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';
import { getRevenueMetrics, getCustomerRevenueByPeriod, syncCustomersToRevenue, upsertCustomerRevenue } from '@/services/revenue-service';
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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  
  // Extract the loading logic into a separate function so we can call it for refresh
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load revenue data for the selected period range first
      const revenueData = await getCustomerRevenueByPeriod(
        startYear, 
        startMonth, 
        endYear, 
        endMonth
      );
      
      console.log(`Loaded ${revenueData.length} revenue entries`);
      setRevenueData(revenueData);
      
      // Then try to load metrics for the current month
      const metricsData = await getRevenueMetrics(currentYear, currentMonth);
      console.log('Loaded metrics:', metricsData);
      setMetrics(metricsData);
      
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
  
  // Function to sync customers to revenue table with status tracking
  const syncCustomers = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      console.log(`Starting customer sync from hook for ${currentMonth}/${currentYear}`);
      const success = await syncCustomersToRevenue(currentYear, currentMonth);
      
      if (success) {
        setSyncStatus('success');
        // Refresh data after successful sync
        await loadData();
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error syncing customers:', error);
      setSyncStatus('error');
      toast({
        title: 'Error',
        description: 'Customer synchronization failed',
        variant: 'destructive'
      });
    }
  }, [currentYear, currentMonth, loadData]);
  
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
    refreshData,
    syncCustomers,
    syncStatus
  };
};
