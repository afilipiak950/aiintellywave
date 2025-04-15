
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ExcelLikeTable from './ExcelLikeTable';
import { ExcelTableMetrics } from './table-utils/useExcelTableData';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface StandardExcelViewProps {
  error?: string | null;
}

const StandardExcelView: React.FC<StandardExcelViewProps> = ({ error }) => {
  const { setCalculatedMetrics } = useRevenueDashboard(12);
  const [tableMetrics, setTableMetrics] = useState<ExcelTableMetrics | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSyncedData, setHasSyncedData] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Use refs to track state without triggering re-renders
  const isMountedRef = useRef(true);
  const isUpdatingRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Only update metrics when they actually change, using debounce
  const debouncedTableMetrics = useDebounce(tableMetrics, 500);
  
  // Update dashboard metrics when table metrics change
  useEffect(() => {
    if (setCalculatedMetrics && debouncedTableMetrics) {
      console.log('Updating dashboard metrics with:', debouncedTableMetrics);
      setCalculatedMetrics({
        total_revenue: debouncedTableMetrics.totalRevenue,
        total_appointments: debouncedTableMetrics.appointmentsCount || 0,
        avg_revenue_per_appointment: debouncedTableMetrics.appointmentsCount ? 
          debouncedTableMetrics.appointmentRevenue / debouncedTableMetrics.appointmentsCount : 0,
        total_recurring_revenue: debouncedTableMetrics.recurringIncome,
        total_setup_revenue: debouncedTableMetrics.setupRevenue || 0,
        customer_count: debouncedTableMetrics.customerCount
      });
    }
  }, [debouncedTableMetrics, setCalculatedMetrics]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);
  
  // Function to load Excel data from Supabase with improved error handling
  const loadExcelData = useCallback(async () => {
    if (isUpdatingRef.current) {
      console.log('Skipping load during update');
      return null;
    }
    
    try {
      setIsLoadingData(true);
      
      const { data, error } = await supabase
        .from('excel_table_data')
        .select('*')
        .eq('table_name', 'revenue_excel')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log('Loaded Excel data from database:', data[0]);
        if (isMountedRef.current) {
          setHasSyncedData(true);
        }
        return data[0];
      }
      return null;
    } catch (error) {
      console.error('Error loading Excel data:', error);
      toast({
        title: "Error",
        description: "Failed to load Excel data. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoadingData(false);
      }
    }
  }, []);
  
  // Function to save Excel data to Supabase with improved error handling
  const saveExcelData = useCallback(async (tableName: string, columns: string[], rowLabels: string[], data: any) => {
    // Prevent saving while already saving or loading
    if (isSaving || isLoadingData || isUpdatingRef.current) {
      console.log('Skipping save during loading/saving');
      return;
    }
    
    try {
      if (isMountedRef.current) {
        setIsSaving(true);
        isUpdatingRef.current = true;
      }
      
      console.log('Saving Excel data to database:', { tableName, columns, rowLabels, data });
      
      // Format the data with properly formatted timestamps
      const insertData = {
        table_name: tableName,
        columns: columns,
        row_labels: rowLabels,
        data: data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('excel_table_data')
        .upsert(insertData, { 
          onConflict: 'user_id,table_name'
        });
      
      if (error) throw error;
      
      console.log('Saved Excel data successfully');
      if (isMountedRef.current) {
        setHasSyncedData(true);
      }
    } catch (error) {
      console.error('Error saving Excel data:', error);
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to save Excel data",
          variant: "destructive"
        });
      }
    } finally {
      // Use a delay before changing states to prevent UI flicker
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsSaving(false);
          isUpdatingRef.current = false;
        }
      }, 500);
    }
  }, [isSaving, isLoadingData]);
  
  // Handle metrics changes from the Excel table
  const handleMetricsChange = useCallback((newMetrics: ExcelTableMetrics) => {
    if (isMountedRef.current) {
      setTableMetrics(newMetrics);
    }
  }, []);
  
  // Set up real-time subscription for Excel data changes with proper cleanup
  useEffect(() => {
    // Create channel with a unique identifier to avoid multiple subscriptions
    const uniqueChannelId = 'excel-table-changes-' + Date.now();
    const channel = supabase
      .channel(uniqueChannelId)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'excel_table_data',
          filter: `table_name=eq.revenue_excel`
        },
        (payload) => {
          // Only update if we're not currently saving to avoid circular updates
          if (!isUpdatingRef.current && isMountedRef.current) {
            console.log('Real-time update for Excel data:', payload);
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
  }, [loadExcelData]);
  
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
