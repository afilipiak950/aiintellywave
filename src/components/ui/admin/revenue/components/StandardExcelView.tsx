import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCw } from 'lucide-react';
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
  const [excelData, setExcelData] = useState<any | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const isMountedRef = useRef(true);
  const isUpdatingRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedTableMetrics = useDebounce(tableMetrics, 500);
  
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
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);
  
  const loadExcelData = useCallback(async () => {
    if (isUpdatingRef.current) {
      console.log('Skipping load during update');
      return null;
    }
    
    try {
      setIsLoadingData(true);
      setLoadError(null);
      
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
          setExcelData(data[0]);
        }
        return data[0];
      }
      
      console.log('No Excel data found in database');
      return null;
    } catch (error) {
      console.error('Error loading Excel data:', error);
      if (isMountedRef.current) {
        setLoadError('Fehler beim Laden der Excel-Daten. Bitte versuchen Sie es erneut.');
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Excel-Daten. Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setTimeout(() => {
          setIsLoadingData(false);
        }, 300);
      }
    }
  }, []);
  
  const saveExcelData = useCallback(async (tableName: string, columns: string[], rowLabels: string[], data: any) => {
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
          onConflict: 'table_name,user_id'
        });
      
      if (error) throw error;
      
      console.log('Saved Excel data successfully');
      if (isMountedRef.current) {
        setHasSyncedData(true);
        setExcelData(insertData);
      }
    } catch (error) {
      console.error('Error saving Excel data:', error);
      if (isMountedRef.current) {
        toast({
          title: "Fehler",
          description: "Fehler beim Speichern der Excel-Daten",
          variant: "destructive"
        });
      }
    } finally {
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
  
  const handleMetricsChange = useCallback((newMetrics: ExcelTableMetrics) => {
    if (isMountedRef.current) {
      setTableMetrics(newMetrics);
    }
  }, []);
  
  const refreshData = useCallback(() => {
    loadExcelData();
  }, [loadExcelData]);
  
  useEffect(() => {
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
          if (!isUpdatingRef.current && isMountedRef.current) {
            console.log('Real-time update for Excel data:', payload);
            loadExcelData();
          }
        }
      )
      .subscribe();
      
    loadExcelData();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadExcelData]);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden der Daten</AlertTitle>
        <AlertDescription>
          {loadError}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={refreshData}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Erneut versuchen
          </Button>
        </AlertDescription>
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
        initialData={excelData}
        isSaving={isSaving}
        hasSyncedData={hasSyncedData}
        isLoading={isLoadingData}
        onRefreshData={refreshData}
      />
    </div>
  );
};

export default StandardExcelView;
