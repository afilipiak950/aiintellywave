
import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExcelTableData, ExcelTableMetrics } from './table-utils/useExcelTableData';
import { exportTableToCsv } from './table-utils/exportUtils';
import ExcelTableHeader from './excel-table/ExcelTableHeader';
import ExcelTableRows from './excel-table/ExcelTableRows';
import ExcelTableToolbar from './excel-table/ExcelTableToolbar';
import { Skeleton } from '@/components/ui/skeleton';

interface ExcelLikeTableProps {
  initialColumns?: string[];
  initialRows?: number;
  className?: string;
  currentYear?: number;
  onMetricsChange?: (metrics: ExcelTableMetrics) => void;
  onDataChange?: (tableName: string, columns: string[], rowLabels: string[], data: any) => void;
  loadData?: () => Promise<any | null>;
  isSaving?: boolean;
  hasSyncedData?: boolean;
}

const ExcelLikeTable: React.FC<ExcelLikeTableProps> = ({
  initialColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  initialRows = 10,
  className,
  currentYear = new Date().getFullYear() % 100, // Default to current year (last 2 digits)
  onMetricsChange,
  onDataChange,
  loadData,
  isSaving = false,
  hasSyncedData = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Send metrics to parent component whenever they change
  useEffect(() => {
    if (onMetricsChange && tableMetrics) {
      onMetricsChange(tableMetrics);
    }
  }, [tableMetrics, onMetricsChange]);
  
  // Save data to database when it changes
  useEffect(() => {
    if (!onDataChange || isLoading) return;
    
    const saveData = () => {
      const serializableData = getSerializableData();
      onDataChange('revenue_excel', columns, rowLabels, serializableData);
    };
    
    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [data, columns, rowLabels, onDataChange, isLoading, getSerializableData]);
  
  // Load initial data from database
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (loadData) {
        try {
          const savedData = await loadData();
          if (savedData) {
            initializeWithData(
              savedData.columns || initialColumns,
              savedData.row_labels || [],
              savedData.data || {}
            );
          }
        } catch (error) {
          console.error('Failed to load Excel data:', error);
        }
      }
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [loadData, initializeWithData, initialColumns]);
  
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
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full mb-4" />
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
        isSaving={isSaving}
        hasSyncedData={hasSyncedData}
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

export default ExcelLikeTable;
