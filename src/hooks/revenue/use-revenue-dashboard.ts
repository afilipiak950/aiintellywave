
import { useState, useCallback, useMemo } from 'react';
import { useRevenueData } from './use-revenue-data';
import { useRevenuePeriods } from './use-revenue-periods';
import { useRevenueCalculations } from './use-revenue-calculations';
import { useCheckPermissions } from '@/hooks/use-check-permissions';
import { CustomerRevenueRow, MonthColumn, RevenueMetrics, CustomerRevenue } from '@/types/revenue';

/**
 * Main hook for the revenue dashboard that combines period, data and calculations
 */
export const useRevenueDashboard = (initialMonthsToShow: number = 6) => {
  const [updatedFields, setUpdatedFields] = useState<Record<string, string[]>>({});
  const { permissions, loading: permissionsLoading, error: permissionsError } = useCheckPermissions();
  
  // Use revenue periods hook to handle date and range related calculations
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
  
  // Use revenue data hook to handle fetching and updating data
  const {
    loading: dataLoading,
    metrics,
    revenueData,
    updateRevenueCell,
    refreshData,
    syncCustomers,
    syncStatus,
    lastFetch
  } = useRevenueData(
    periods.startYear,
    periods.startMonth,
    periods.endYear,
    periods.endMonth,
    currentYear,
    currentMonth
  );
  
  // Use revenue calculations hook to compute derived values from revenue data
  const {
    customerRows,
    monthlyTotals,
    exportCsv
  } = useRevenueCalculations(revenueData, monthColumns);
  
  // Calculated loading state combining all sources of loading
  const loading = dataLoading || permissionsLoading;
  
  return {
    loading,
    permissions,
    permissionsError,
    metrics,
    monthColumns,
    customerRows,
    monthlyTotals,
    navigateMonths,
    updateRevenueCell,
    monthsToShow,
    changeMonthsToShow,
    currentMonth,
    currentYear,
    exportCsv,
    changeYearFilter,
    yearFilter,
    refreshData,
    syncCustomers,
    syncStatus,
    lastFetch,
    updatedFields,
    setUpdatedFields
  };
};
