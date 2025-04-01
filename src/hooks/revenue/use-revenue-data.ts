
import { useState, useEffect, useCallback, useRef } from 'react';
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';
import { getRevenueMetrics, getCustomerRevenueByPeriod, syncCustomersToRevenue, upsertCustomerRevenue } from '@/services/revenue-service';
import { subscribeToCustomerChanges, subscribeToRevenueChanges } from '@/services/revenue/revenue-sync-service';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for fetching and managing revenue data with real-time updates
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
  const [updatedFields, setUpdatedFields] = useState<Record<string, string[]>>({});
  
  // Use refs to avoid unnecessary re-renders and dependency issues
  const paramsRef = useRef({ 
    startYear, 
    startMonth, 
    endYear, 
    endMonth, 
    currentYear, 
    currentMonth 
  });
  
  // Update refs when params change
  useEffect(() => {
    paramsRef.current = { 
      startYear, 
      startMonth, 
      endYear, 
      endMonth, 
      currentYear, 
      currentMonth 
    };
  }, [startYear, startMonth, endYear, endMonth, currentYear, currentMonth]);
  
  // Extract the loading logic into a separate function so we can call it for refresh
  const loadData = useCallback(async (trackUpdated = false, previousData: CustomerRevenue[] = []) => {
    setLoading(true);
    try {
      // Load revenue data for the selected period range first
      const revenueData = await getCustomerRevenueByPeriod(
        paramsRef.current.startYear, 
        paramsRef.current.startMonth, 
        paramsRef.current.endYear, 
        paramsRef.current.endMonth
      );
      
      console.log(`Loaded ${revenueData.length} revenue entries`);
      
      // If we're tracking what changed, compare with previous data
      if (trackUpdated && previousData.length > 0) {
        const updatedFieldsMap: Record<string, string[]> = {};
        
        revenueData.forEach(newEntry => {
          const oldEntry = previousData.find(
            p => p.customer_id === newEntry.customer_id && 
                 p.year === newEntry.year && 
                 p.month === newEntry.month
          );
          
          if (oldEntry) {
            const changedFields: string[] = [];
            if (oldEntry.setup_fee !== newEntry.setup_fee) changedFields.push('setup_fee');
            if (oldEntry.price_per_appointment !== newEntry.price_per_appointment) changedFields.push('price_per_appointment');
            if (oldEntry.appointments_delivered !== newEntry.appointments_delivered) changedFields.push('appointments_delivered');
            if (oldEntry.recurring_fee !== newEntry.recurring_fee) changedFields.push('recurring_fee');
            if (oldEntry.total_revenue !== newEntry.total_revenue) changedFields.push('total_revenue');
            
            if (changedFields.length > 0) {
              const key = `${newEntry.customer_id}-${newEntry.year}-${newEntry.month}`;
              updatedFieldsMap[key] = changedFields;
            }
          }
        });
        
        setUpdatedFields(updatedFieldsMap);
        
        // Clear updated fields after 2 seconds
        setTimeout(() => {
          setUpdatedFields({});
        }, 2000);
      }
      
      setRevenueData(revenueData);
      
      // Then try to load metrics for the current month
      const metricsData = await getRevenueMetrics(
        paramsRef.current.currentYear, 
        paramsRef.current.currentMonth
      );
      console.log('Loaded metrics:', metricsData);
      setMetrics(metricsData);
      
    } catch (error) {
      console.error('Error loading revenue dashboard data:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Umsatzdaten',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Function to sync customers to revenue table with status tracking
  const syncCustomers = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      console.log(`Starting customer sync from hook for ${paramsRef.current.currentMonth}/${paramsRef.current.currentYear}`);
      const success = await syncCustomersToRevenue(
        paramsRef.current.currentYear, 
        paramsRef.current.currentMonth
      );
      
      if (success) {
        setSyncStatus('success');
        toast({
          title: 'Erfolg',
          description: 'Kundensynchronisierung abgeschlossen',
        });
        // Refresh data after successful sync
        await loadData();
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error syncing customers:', error);
      setSyncStatus('error');
      toast({
        title: 'Fehler',
        description: 'Kundensynchronisierung fehlgeschlagen',
        variant: 'destructive'
      });
    }
  }, [loadData]);
  
  // Subscribe to real-time changes when component mounts
  useEffect(() => {
    // Initial data load
    loadData();
    
    // Set up real-time subscriptions for both customers and revenue tables
    const unsubscribeCustomer = subscribeToCustomerChanges(() => {
      console.log('Customer data changed, refreshing data');
      const previousData = [...revenueData];
      loadData(true, previousData);
    });
    
    const unsubscribeRevenue = subscribeToRevenueChanges(() => {
      console.log('Revenue data changed, refreshing data');
      const previousData = [...revenueData];
      loadData(true, previousData);
    });
    
    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeCustomer();
      unsubscribeRevenue();
    };
  }, [loadData, revenueData]);
  
  // Create a function to manually refresh data
  const refreshData = useCallback(() => {
    const previousData = [...revenueData];
    loadData(true, previousData);
  }, [loadData, revenueData]);
  
  // Handle updating a cell in the table
  const updateRevenueCell = async (data: CustomerRevenue) => {
    try {
      const result = await upsertCustomerRevenue(data);
      
      if (result) {
        toast({
          title: 'Erfolg',
          description: 'Umsatzdaten aktualisiert',
        });
      }
    } catch (error) {
      console.error('Error updating revenue cell:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Aktualisieren der Umsatzdaten',
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
    syncStatus,
    updatedFields
  };
};
