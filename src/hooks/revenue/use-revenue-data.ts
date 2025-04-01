
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
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  // Use refs to avoid unnecessary re-renders and dependency issues
  const paramsRef = useRef({ 
    startYear, 
    startMonth, 
    endYear, 
    endMonth, 
    currentYear, 
    currentMonth 
  });
  
  // Track whether component is mounted
  const isMounted = useRef(true);
  
  // Track active fetch to prevent redundant parallel fetches
  const activeFetchRef = useRef<boolean>(false);
  
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Extract the loading logic into a separate function so we can call it for refresh
  const loadData = useCallback(async (trackUpdated = false, previousData: CustomerRevenue[] = []) => {
    if (activeFetchRef.current) {
      console.log('Fetch already in progress, skipping redundant request');
      return;
    }
    
    activeFetchRef.current = true;
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
        
        if (Object.keys(updatedFieldsMap).length > 0) {
          setUpdatedFields(updatedFieldsMap);
          
          // Clear updated fields after 2 seconds
          setTimeout(() => {
            if (isMounted.current) {
              setUpdatedFields({});
            }
          }, 2000);
        }
      }
      
      if (isMounted.current) {
        setRevenueData(revenueData);
        setLastFetch(new Date());
      }
      
      // Then try to load metrics for the current month
      const metricsData = await getRevenueMetrics(
        paramsRef.current.currentYear, 
        paramsRef.current.currentMonth
      );
      
      if (isMounted.current) {
        console.log('Loaded metrics:', metricsData);
        setMetrics(metricsData);
      }
      
    } catch (error) {
      console.error('Error loading revenue dashboard data:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Umsatzdaten',
        variant: 'destructive'
      });
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      activeFetchRef.current = false;
    }
  }, []);
  
  // Function to sync customers to revenue table with status tracking
  const syncCustomers = useCallback(async () => {
    if (activeFetchRef.current) {
      console.log('Operation already in progress, skipping sync');
      return;
    }
    
    setSyncStatus('syncing');
    activeFetchRef.current = true;
    
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
        // Refresh data after successful sync, but don't track updates
        await loadData(false);
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
    } finally {
      activeFetchRef.current = false;
    }
  }, [loadData]);
  
  // Set up real-time subscriptions when component mounts
  useEffect(() => {
    // Initial data load - only if not already loading
    if (!activeFetchRef.current) {
      loadData();
    }
    
    const handleRealtimeUpdate = () => {
      console.log('Realtime update triggered');
      const previousData = [...revenueData];
      
      // Only reload if last fetch was more than 1 second ago to prevent rapid updates
      const now = new Date();
      if (!lastFetch || (now.getTime() - lastFetch.getTime() > 1000)) {
        loadData(true, previousData);
      } else {
        console.log('Skipping reload - last fetch too recent');
      }
    };
    
    // Set up real-time subscriptions for both customers and revenue tables
    const unsubscribeCustomer = subscribeToCustomerChanges(handleRealtimeUpdate);
    const unsubscribeRevenue = subscribeToRevenueChanges(handleRealtimeUpdate);
    
    // Clean up subscriptions when component unmounts
    return () => {
      unsubscribeCustomer();
      unsubscribeRevenue();
    };
  }, [loadData, revenueData, lastFetch]);
  
  // Create a function to manually refresh data
  const refreshData = useCallback(() => {
    if (activeFetchRef.current) {
      console.log('Fetch already in progress, skipping refresh');
      return;
    }
    
    console.log('Manually refreshing data');
    const previousData = [...revenueData];
    loadData(true, previousData);
  }, [loadData, revenueData]);
  
  // Handle updating a cell in the table
  const updateRevenueCell = useCallback(async (data: CustomerRevenue) => {
    try {
      const result = await upsertCustomerRevenue(data);
      
      if (result) {
        toast({
          title: 'Erfolg',
          description: 'Umsatzdaten aktualisiert',
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating revenue cell:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Aktualisieren der Umsatzdaten',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  return {
    loading,
    metrics,
    revenueData,
    updateRevenueCell,
    refreshData,
    syncCustomers,
    syncStatus,
    updatedFields,
    lastFetch
  };
};
