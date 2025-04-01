
import { useState, useEffect, useMemo } from 'react';
import { CustomerRevenue, RevenueMetrics, MonthColumn, CustomerRevenueRow } from '@/types/revenue';
import { getRevenueMetrics, getCustomerRevenueByPeriod, upsertCustomerRevenue } from '@/services/revenue-service';
import { toast } from '@/hooks/use-toast';

export const useRevenueDashboard = (initialMonthsToShow: number = 6) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<CustomerRevenue[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthsToShow, setMonthsToShow] = useState<number>(initialMonthsToShow);
  
  // Calculate start and end periods for the data range
  const periods = useMemo(() => {
    const endYear = currentYear;
    const endMonth = currentMonth;
    
    let startYear = endYear;
    let startMonth = endMonth - (monthsToShow - 1);
    
    // Adjust if we need to go back to previous year(s)
    while (startMonth <= 0) {
      startYear--;
      startMonth += 12;
    }
    
    return {
      startYear,
      startMonth,
      endYear,
      endMonth
    };
  }, [currentYear, currentMonth, monthsToShow]);
  
  // Generate month columns for the table
  const monthColumns = useMemo((): MonthColumn[] => {
    const columns: MonthColumn[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    let { startYear, startMonth, endYear, endMonth } = periods;
    
    let currentYear = startYear;
    let currentMonth = startMonth;
    
    while (
      currentYear < endYear || 
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      columns.push({
        year: currentYear,
        month: currentMonth,
        label: `${monthNames[currentMonth - 1]} ${currentYear}`
      });
      
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }
    
    return columns;
  }, [periods]);
  
  // Transform raw revenue data into rows organized by customer
  const customerRows = useMemo((): CustomerRevenueRow[] => {
    const customerMap = new Map<string, CustomerRevenueRow>();
    
    // First, create entries for each customer
    revenueData.forEach(entry => {
      if (!customerMap.has(entry.customer_id)) {
        customerMap.set(entry.customer_id, {
          customer_id: entry.customer_id,
          customer_name: entry.customer_name || 'Unknown Customer',
          months: {}
        });
      }
      
      // Add month data for this customer
      const key = `${entry.year}-${entry.month}`;
      customerMap.get(entry.customer_id)!.months[key] = entry;
    });
    
    return Array.from(customerMap.values());
  }, [revenueData]);
  
  // Calculate totals for each month
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, {
      setup_fee: number;
      appointments: number;
      recurring_fee: number;
      total_revenue: number;
    }> = {};
    
    // Initialize totals for all months
    monthColumns.forEach(col => {
      const key = `${col.year}-${col.month}`;
      totals[key] = {
        setup_fee: 0,
        appointments: 0,
        recurring_fee: 0,
        total_revenue: 0
      };
    });
    
    // Accumulate totals from all customers
    revenueData.forEach(entry => {
      const key = `${entry.year}-${entry.month}`;
      if (totals[key]) {
        totals[key].setup_fee += entry.setup_fee || 0;
        totals[key].appointments += entry.appointments_delivered || 0;
        totals[key].recurring_fee += entry.recurring_fee || 0;
        totals[key].total_revenue += (entry.total_revenue || 0);
      }
    });
    
    return totals;
  }, [revenueData, monthColumns]);
  
  // Load data when periods change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load metrics for the current month
        const metricsData = await getRevenueMetrics(currentYear, currentMonth);
        setMetrics(metricsData);
        
        // Load revenue data for the selected period range
        const { startYear, startMonth, endYear, endMonth } = periods;
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
  }, [periods, currentYear, currentMonth]);
  
  // Handle updating a cell in the table
  const updateRevenueCell = async (data: CustomerRevenue) => {
    try {
      const result = await upsertCustomerRevenue(data);
      
      if (result) {
        // Refresh data after update
        const { startYear, startMonth, endYear, endMonth } = periods;
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
  
  // Navigate to previous/next month range
  const navigateMonths = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;
    
    if (direction === 'next') {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    } else {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };
  
  // Change number of months displayed
  const changeMonthsToShow = (count: number) => {
    setMonthsToShow(count);
  };
  
  return {
    loading,
    metrics,
    monthColumns,
    customerRows,
    monthlyTotals,
    periods,
    currentYear,
    currentMonth,
    monthsToShow,
    updateRevenueCell,
    navigateMonths,
    changeMonthsToShow
  };
};
