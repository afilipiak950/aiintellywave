
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ExcelLikeTable from './ExcelLikeTable';
import { ExcelTableMetrics } from './table-utils/useExcelTableData';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const { setCalculatedMetrics } = useRevenueDashboard(12);
  const [tableMetrics, setTableMetrics] = useState<ExcelTableMetrics | null>(null);
  
  // Handle metrics updates from the Excel table
  const handleMetricsChange = (newMetrics: ExcelTableMetrics) => {
    setTableMetrics(newMetrics);
    
    // Update the dashboard metrics if function exists
    if (setCalculatedMetrics) {
      setCalculatedMetrics({
        total_revenue: newMetrics.totalRevenue,
        total_appointments: 0, // Not available from table 
        avg_revenue_per_appointment: 0, // Not available from table
        total_recurring_revenue: newMetrics.recurringIncome,
        total_setup_revenue: 0, // Not available from table
        customer_count: newMetrics.customerCount
      });
    }
  };
  
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
