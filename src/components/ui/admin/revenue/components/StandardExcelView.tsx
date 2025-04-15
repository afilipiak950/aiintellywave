
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ExcelLikeTable from './ExcelLikeTable';
import { ExcelTableMetrics } from './table-utils/useExcelTableData';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { debounce } from 'lodash';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const { setCalculatedMetrics } = useRevenueDashboard(12);
  const [tableMetrics, setTableMetrics] = useState<ExcelTableMetrics | null>(null);
  
  // Use debounced function to prevent too many updates
  const debouncedUpdateMetrics = useCallback(
    debounce((newMetrics: ExcelTableMetrics) => {
      console.log('Updating dashboard metrics with:', newMetrics);
      if (setCalculatedMetrics) {
        setCalculatedMetrics({
          total_revenue: newMetrics.totalRevenue,
          total_appointments: newMetrics.appointmentsCount || 0,
          avg_revenue_per_appointment: newMetrics.appointmentsCount ? 
            newMetrics.appointmentRevenue / newMetrics.appointmentsCount : 0,
          total_recurring_revenue: newMetrics.recurringIncome,
          total_setup_revenue: newMetrics.setupRevenue || 0,
          customer_count: newMetrics.customerCount
        });
      }
    }, 500),
    [setCalculatedMetrics]
  );
  
  // Handle metrics updates from the Excel table
  const handleMetricsChange = useCallback((newMetrics: ExcelTableMetrics) => {
    setTableMetrics(newMetrics);
    debouncedUpdateMetrics(newMetrics);
  }, [debouncedUpdateMetrics]);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      <ExcelLikeTable 
        onMetricsChange={handleMetricsChange}
        currentYear={new Date().getFullYear()}
      />
    </div>
  );
};

export default StandardExcelView;
