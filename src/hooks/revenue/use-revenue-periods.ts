
import { useState, useMemo } from 'react';
import { MonthColumn } from '@/types/revenue';

/**
 * Hook for managing revenue period navigation and calculations
 */
export const useRevenuePeriods = (initialMonthsToShow: number = 6) => {
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
    currentYear,
    currentMonth,
    monthsToShow,
    periods,
    monthColumns,
    navigateMonths,
    changeMonthsToShow
  };
};
