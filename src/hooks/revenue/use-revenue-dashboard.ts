
import { useState } from 'react';
import { CustomerRevenue } from '@/types/revenue';
import { useRevenuePeriods } from './use-revenue-periods';
import { useRevenueData } from './use-revenue-data';
import { useRevenueCalculations } from './use-revenue-calculations';

/**
 * Main hook combining all revenue dashboard functionality
 */
export const useRevenueDashboard = (initialMonthsToShow: number = 6) => {
  const {
    currentYear,
    currentMonth,
    monthsToShow,
    periods,
    monthColumns,
    navigateMonths,
    changeMonthsToShow
  } = useRevenuePeriods(initialMonthsToShow);
  
  const {
    loading,
    metrics,
    revenueData,
    updateRevenueCell
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
    updateRevenueCell: handleCellUpdate,  // Expose the handleCellUpdate function as updateRevenueCell
    navigateMonths,
    changeMonthsToShow,
    exportCsv: handleExportCsv
  };
};

// Re-export for backward compatibility
export { useRevenueDashboard as default } from './use-revenue-dashboard';
