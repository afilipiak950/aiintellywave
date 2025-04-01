
import { useMemo } from 'react';
import { CustomerRevenue, MonthColumn, CustomerRevenueRow } from '@/types/revenue';

/**
 * Hook for revenue data calculations and transformations
 */
export const useRevenueCalculations = (
  revenueData: CustomerRevenue[],
  monthColumns: MonthColumn[]
) => {
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

  // Export data as CSV
  const exportCsv = (currentYear: number, currentMonth: number) => {
    // Convert data to CSV format
    const headers = ['Customer', ...monthColumns.map(col => col.label), 'Total'];
    const rows = customerRows.map(row => {
      const customerName = row.customer_name;
      const monthData = monthColumns.map(col => {
        const key = `${col.year}-${col.month}`;
        const monthRevenue = row.months[key]?.total_revenue || 0;
        return monthRevenue.toFixed(2);
      });
      
      // Calculate total for this customer
      const total = monthColumns.reduce((sum, col) => {
        const key = `${col.year}-${col.month}`;
        return sum + (row.months[key]?.total_revenue || 0);
      }, 0);
      
      return [customerName, ...monthData, total.toFixed(2)];
    });
    
    // Add totals row
    const totalRow = ['TOTAL'];
    monthColumns.forEach(col => {
      const key = `${col.year}-${col.month}`;
      totalRow.push((monthlyTotals[key]?.total_revenue || 0).toFixed(2));
    });
    
    // Calculate grand total
    const grandTotal = Object.values(monthlyTotals).reduce(
      (sum, month) => sum + month.total_revenue, 
      0
    );
    totalRow.push(grandTotal.toFixed(2));
    
    rows.push(totalRow);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_report_${currentYear}_${currentMonth}.csv`;
    link.click();
  };

  return {
    customerRows,
    monthlyTotals,
    exportCsv
  };
};
