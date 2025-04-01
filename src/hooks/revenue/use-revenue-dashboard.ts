
import { useState } from 'react';
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
    refreshData  // Make sure we're getting this from useRevenueData
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
  
  // Handle cell update
  const handleCellUpdate = (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => {
    const monthKey = `${year}-${month}`;
    const customerRow = customerRows.find(row => row.customer_id === customerId);
    
    if (!customerRow) return;
    
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
  };
  
  // Export data as CSV wrapper
  const handleExportCsv = () => {
    exportCsv(currentYear, currentMonth);
  };
  
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
    refreshData  // Include the refresh function in the return object
  };
};

// Re-export for backward compatibility
export { useRevenueDashboard as default };
