
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ExcelLikeTable from './ExcelLikeTable';
import { ExcelTableMetrics } from './table-utils/useExcelTableData';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { debounce } from 'lodash';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const { setCalculatedMetrics } = useRevenueDashboard(12);
  const [tableMetrics, setTableMetrics] = useState<ExcelTableMetrics | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSyncedData, setHasSyncedData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Use debounced function to prevent too many dashboard updates
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
  
  // Function to load Excel data from Supabase with a stable reference 
  const loadExcelData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      
      const { data, error } = await supabase
        .from('excel_table_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Loaded Excel data from database:', data[0]);
        setHasSyncedData(true);
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Error loading Excel data:', error);
      return null;
    } finally {
      setIsLoadingData(false);
    }
  }, []);
  
  // Function to save Excel data to Supabase with stabilized state updates
  const saveExcelData = useCallback(async (tableName: string, columns: string[], rowLabels: string[], data: any) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      console.log('Saving Excel data to database:', { tableName, columns, rowLabels, data });
      
      // Format the data for Supabase
      const insertData = {
        table_name: tableName,
        columns: columns,
        row_labels: rowLabels,
        data: data,
        updated_at: new Date().toISOString() // Convert Date to ISO string
      };
      
      const { error } = await supabase
        .from('excel_table_data')
        .upsert(insertData, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      console.log('Saved Excel data successfully');
      setHasSyncedData(true);
    } catch (error) {
      console.error('Error saving Excel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Excel data',
        variant: 'destructive'
      });
    } finally {
      // Use a slight delay before changing the saving state to prevent flicker
      setTimeout(() => {
        setIsSaving(false);
      }, 300);
    }
  }, [isSaving]);
  
  // Set up real-time subscription for Excel data changes with proper cleanup
  useEffect(() => {
    // Create channel with a unique identifier to avoid multiple subscriptions
    const channel = supabase
      .channel('excel-table-changes-' + Date.now())
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'excel_table_data' 
        },
        (payload) => {
          console.log('Real-time update for Excel data:', payload);
          // Only update if we're not currently saving to avoid circular updates
          if (!isSaving) {
            loadExcelData();
          }
        }
      )
      .subscribe();
      
    // Load initial data
    loadExcelData();
      
    return () => {
      // Clean up subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, [loadExcelData, isSaving]);
  
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
        onDataChange={saveExcelData}
        loadData={loadExcelData}
        isSaving={isSaving}
        hasSyncedData={hasSyncedData}
        isLoading={isLoadingData}
      />
    </div>
  );
};

export default StandardExcelView;
