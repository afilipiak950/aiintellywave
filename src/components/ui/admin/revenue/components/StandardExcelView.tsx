
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ExcelLikeTable from './ExcelLikeTable';
import { ExcelTableMetrics } from './table-utils/useExcelTableData';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const [tableMetrics, setTableMetrics] = useState<ExcelTableMetrics | null>(null);
  
  // Handle metrics updates from the Excel table
  const handleMetricsChange = (newMetrics: ExcelTableMetrics) => {
    // Nur aktualisieren, wenn sich die Werte tatsächlich geändert haben
    if (!tableMetrics || 
        tableMetrics.totalRevenue !== newMetrics.totalRevenue ||
        tableMetrics.customerCount !== newMetrics.customerCount ||
        tableMetrics.recurringIncome !== newMetrics.recurringIncome) {
      setTableMetrics(newMetrics);
      
      // Dashboard-Metriken aktualisieren, wenn Hook-Funktion verfügbar ist
      // Diese Zeile wurde auskommentiert, um die Endlosschleife zu vermeiden
      // Stattdessen können wir das nach einem initialen Rendering tun
      // if (setCalculatedMetrics) {
      //   setCalculatedMetrics({...});
      // }
    }
  };
  
  // Separate Funktion, um die Dashboard-Metriken zu aktualisieren - wenn nötig
  // Diese ist auskommentiert, da wir momentan keine direkte Verbindung zum Dashboard benötigen
  /*
  useEffect(() => {
    // Diese Funktion könnte bei Bedarf später wieder aktiviert werden
    if (tableMetrics && setCalculatedMetrics) {
      setCalculatedMetrics({
        total_revenue: tableMetrics.totalRevenue,
        total_appointments: 0, 
        avg_revenue_per_appointment: 0,
        total_recurring_revenue: tableMetrics.recurringIncome,
        total_setup_revenue: 0,
        customer_count: tableMetrics.customerCount
      });
    }
  }, [tableMetrics]);
  */
  
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
