
import { useState, useCallback, useEffect } from 'react';
import { CustomerRevenue } from '@/types/revenue';
import { useRevenuePeriods } from './use-revenue-periods';
import { useRevenueData } from './use-revenue-data';
import { useRevenueCalculations } from './use-revenue-calculations';

/**
 * Main hook combining all revenue dashboard functionality
 */
export const useRevenueDashboard = (initialMonthsToShow: number = 12) => {
  const {
    currentYear,
    currentMonth,
    monthsToShow,
    periods,
    monthColumns,
    navigateMonths,
    changeMonthsToShow,
    changeYearFilter,
    yearFilter
  } = useRevenuePeriods(initialMonthsToShow);
  
  const {
    loading,
    metrics,
    revenueData,
    updateRevenueCell,
    refreshData
  } = useRevenueData(
    periods.startYear,
    periods.startMonth,
    periods.endYear,
    periods.endMonth,
    currentYear,
    currentMonth
  );
  
  const {
    customerRows,
    monthlyTotals,
    exportCsv
  } = useRevenueCalculations(revenueData, monthColumns);
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  
  // Handle cell update with improved error handling
  const handleCellUpdate = useCallback((
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => {
    try {
      const monthKey = `${year}-${month}`;
      const customerRow = customerRows.find(row => row.customer_id === customerId);
      
      if (!customerRow) {
        console.error(`Customer row not found for ID: ${customerId}`);
        return;
      }
      
      const existingData = customerRow.months[monthKey] || {
        customer_id: customerId,
        year,
        month,
        setup_fee: 0,
        price_per_appointment: 0,
        appointments_delivered: 0,
        recurring_fee: 0
      };
      
      const updatedData = {
        ...existingData,
        [field]: value
      };
      
      updateRevenueCell(updatedData);
    } catch (error) {
      console.error('Error in handleCellUpdate:', error);
    }
  }, [customerRows, updateRevenueCell]);
  
  // Export data as CSV wrapper with error handling
  const handleExportCsv = useCallback(() => {
    try {
      exportCsv(currentYear, currentMonth);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  }, [exportCsv, currentYear, currentMonth]);
  
  // Listen for customer updates from the customer table
  useEffect(() => {
    const handleCustomerUpdate = () => {
      console.log('Customer revenue updated event received, refreshing revenue data');
      refreshData();
    };
    
    window.addEventListener('customer-revenue-updated', handleCustomerUpdate);
    
    return () => {
      window.removeEventListener('customer-revenue-updated', handleCustomerUpdate);
    };
  }, [refreshData]);
  
  return {
    loading,
    metrics,
    monthColumns,
    customerRows,
    monthlyTotals,
    activeTab,
    setActiveTab,
    periods,
    currentYear,
    currentMonth,
    monthsToShow,
    updateRevenueCell: handleCellUpdate,
    navigateMonths,
    changeMonthsToShow,
    exportCsv: handleExportCsv,
    changeYearFilter,
    yearFilter,
    refreshData
  };
};

// Re-export for backward compatibility
export { useRevenueDashboard as default };
