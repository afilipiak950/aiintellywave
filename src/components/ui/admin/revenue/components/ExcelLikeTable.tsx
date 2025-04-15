
import React, { useCallback, useEffect, useState, useRef, memo } from 'react';
import { Table } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExcelTableData, ExcelTableMetrics } from './table-utils/useExcelTableData';
import { exportTableToCsv } from './table-utils/exportUtils';
import ExcelTableHeader from './excel-table/ExcelTableHeader';
import ExcelTableRows from './excel-table/ExcelTableRows';
import ExcelTableToolbar from './excel-table/ExcelTableToolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ExcelLikeTableProps {
  initialColumns?: string[];
  initialRows?: number;
  initialData?: any;
  className?: string;
  currentYear?: number;
  onMetricsChange?: (metrics: ExcelTableMetrics) => void;
  onDataChange?: (tableName: string, columns: string[], rowLabels: string[], data: any) => void;
  loadData?: () => Promise<any | null>;
  onRefreshData?: () => void;
  isSaving?: boolean;
  hasSyncedData?: boolean;
  isLoading?: boolean;
}

const ExcelLikeTable: React.FC<ExcelLikeTableProps> = ({
  initialColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  initialRows = 10,
  initialData = null,
  className,
  currentYear = new Date().getFullYear() % 100, // Default to current year (last 2 digits)
  onMetricsChange,
  onDataChange,
  loadData,
  onRefreshData,
  isSaving = false,
  hasSyncedData = false,
  isLoading = true
}) => {
  // Track if initial data has been loaded to prevent flickering during initialization
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const lastSavedDataRef = useRef<any>(null);
  const lastSaveTimeRef = useRef<number>(0);
  
  const {
    data,
    columns,
    rowLabels,
    handleCellChange,
    handleRowLabelChange,
    addRow,
    deleteRow,
    addColumn,
    rowTotals,
    columnTotals,
    columnHeaders,
    tableMetrics,
    initializeWithData,
    getSerializableData
  } = useExcelTableData({
    initialColumns,
    initialRows,
    currentYear
  });
  
  // Send metrics to parent component whenever they change, with debounce
  useEffect(() => {
    if (onMetricsChange && tableMetrics && initialDataLoaded) {
      // Only update metrics if data is fully loaded
      onMetricsChange(tableMetrics);
    }
  }, [tableMetrics, onMetricsChange, initialDataLoaded]);
  
  // Save data to database with proper debouncing to prevent excessive saves
  useEffect(() => {
    if (!onDataChange || isLoading || !initialDataLoaded || isInitialLoadRef.current) return;
    
    // Compare with last saved data to prevent redundant saves
    const serializableData = getSerializableData();
    const currentDataStr = JSON.stringify(serializableData);
    const lastSavedDataStr = JSON.stringify(lastSavedDataRef.current);
    
    // Only save if data has changed and it's been at least 2 seconds since last save
    const now = Date.now();
    if (currentDataStr !== lastSavedDataStr && (now - lastSaveTimeRef.current > 2000)) {
      const timer = setTimeout(() => {
        if (onDataChange && !isLoading) {
          onDataChange('revenue_excel', columns, rowLabels, serializableData);
          lastSavedDataRef.current = JSON.parse(JSON.stringify(serializableData));
          lastSaveTimeRef.current = Date.now();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [data, columns, rowLabels, onDataChange, isLoading, initialDataLoaded, getSerializableData]);
  
  // Handle initialData from props
  useEffect(() => {
    if (initialData && !initialDataLoaded) {
      try {
        console.log('Initializing with provided initial data:', initialData);
        
        initializeWithData(
          initialData.columns || initialColumns,
          initialData.row_labels || [],
          initialData.data || {}
        );
        
        // Store initial data to compare for future saves
        lastSavedDataRef.current = initialData.data;
        
        // After initialization completes, set loaded flag
        setTimeout(() => {
          setInitialDataLoaded(true);
          // After a short delay, allow normal saving to resume
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 200);
        }, 100);
      } catch (error) {
        console.error('Failed to initialize with initial data:', error);
        setHasError('Failed to initialize table data');
        setInitialDataLoaded(true);
        isInitialLoadRef.current = false;
      }
    }
  }, [initialData, initialDataLoaded, initializeWithData, initialColumns]);
  
  // Load initial data from database if initialData isn't provided via props
  useEffect(() => {
    const loadInitialData = async () => {
      if (!initialData && loadData && !initialDataLoaded) {
        try {
          isInitialLoadRef.current = true;
          
          const savedData = await loadData();
          
          if (savedData) {
            console.log('Initializing with server data:', {
              columns: savedData.columns || initialColumns,
              rowLabels: savedData.row_labels || [],
              data: savedData.data || {}
            });
            
            initializeWithData(
              savedData.columns || initialColumns,
              savedData.row_labels || [],
              savedData.data || {}
            );
            
            // Store initial data to compare for future saves
            lastSavedDataRef.current = savedData.data;
          } else {
            // If no data was loaded, initialize with defaults
            console.log('No saved data found, using defaults');
            initializeWithData(
              initialColumns,
              [],
              {}
            );
          }
          
          // After initialization completes, set loaded flag
          setTimeout(() => {
            setInitialDataLoaded(true);
            // After a short delay, allow normal saving to resume
            setTimeout(() => {
              isInitialLoadRef.current = false;
            }, 200);
          }, 100);
        } catch (error) {
          console.error('Failed to load Excel data:', error);
          setHasError('Failed to load table data from server');
          setInitialDataLoaded(true);
          isInitialLoadRef.current = false;
        }
      } else if (!initialData && !loadData) {
        // No data source provided, just set as loaded with defaults
        setInitialDataLoaded(true);
        isInitialLoadRef.current = false;
      }
    };
    
    loadInitialData();
  }, [loadData, initializeWithData, initialColumns, initialData, initialDataLoaded]);
  
  // Memoize the export function to prevent recreating on every render
  const exportCsv = useCallback(() => {
    exportTableToCsv(
      columns,
      rowLabels,
      data,
      columnTotals,
      rowTotals,
      currentYear
    );
  }, [columns, rowLabels, data, columnTotals, rowTotals, currentYear]);
  
  // Handle error state
  if (hasError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{hasError}</AlertDescription>
      </Alert>
    );
  }
  
  // Show loading skeleton while data is loading or initializing
  if (isLoading || !initialDataLoaded) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div>
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <Skeleton className="h-[calc(100vh-300px)] w-full" />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <ExcelTableToolbar
        addRow={addRow}
        addColumn={addColumn}
        exportCsv={exportCsv}
        refreshData={onRefreshData}
        isSaving={isSaving}
        hasSyncedData={hasSyncedData}
        isLoading={isLoading}
      />
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="border rounded">
          <Table className="w-auto min-w-full">
            <ExcelTableHeader 
              columns={columns} 
              columnHeaders={columnHeaders}
              currentYear={currentYear}
            />
            <ExcelTableRows
              rowLabels={rowLabels}
              columns={columns}
              data={data}
              rowTotals={rowTotals}
              columnTotals={columnTotals}
              handleCellChange={handleCellChange}
              handleRowLabelChange={handleRowLabelChange}
              deleteRow={deleteRow}
            />
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ExcelLikeTable);
