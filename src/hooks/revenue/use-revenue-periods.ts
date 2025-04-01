
import { useState, useMemo } from 'react';
import { MonthColumn } from '@/types/revenue';

/**
 * Hook for managing revenue period navigation and calculations
 */
export const useRevenuePeriods = (initialMonthsToShow: number = 12) => {
  // Get current date info
  const currentDate = new Date();
  const actualCurrentYear = currentDate.getFullYear();
  const actualCurrentMonth = currentDate.getMonth() + 1;
  
  // Use the actual current year as default if not testing with 2025
  const [currentYear, setCurrentYear] = useState<number>(actualCurrentYear);
  const [currentMonth, setCurrentMonth] = useState<number>(actualCurrentMonth);
  const [monthsToShow, setMonthsToShow] = useState<number>(initialMonthsToShow);
  const [yearFilter, setYearFilter] = useState<number>(actualCurrentYear);
  
  // Calculate start and end periods for the data range
  const periods = useMemo(() => {
    const endYear = currentYear;
    const endMonth = 12; // Show the entire year
    
    let startYear = endYear;
    let startMonth = 1; // Start from January
    
    return {
      startYear,
      startMonth,
      endYear,
      endMonth
    };
  }, [currentYear, yearFilter]);
  
  // Generate month columns for the table
  const monthColumns = useMemo((): MonthColumn[] => {
    const columns: MonthColumn[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Show all months for the selected year
    for (let month = 1; month <= 12; month++) {
      columns.push({
        year: currentYear,
        month: month,
        label: `${monthNames[month - 1]} ${currentYear}`
      });
    }
    
    return columns;
  }, [currentYear]);
  
  // Navigate to previous/next year
  const navigateYear = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentYear(currentYear - 1);
    }
  };
  
  // Change number of months displayed (keeping this for backward compatibility)
  const changeMonthsToShow = (count: number) => {
    setMonthsToShow(count);
  };
  
  // Change the year filter
  const changeYearFilter = (year: number) => {
    setCurrentYear(year);
    setYearFilter(year);
  };

  return {
    currentYear,
    currentMonth,
    monthsToShow,
    periods,
    monthColumns,
    navigateMonths: navigateYear,
    changeMonthsToShow,
    changeYearFilter,
    yearFilter
  };
};
