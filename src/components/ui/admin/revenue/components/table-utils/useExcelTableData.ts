
import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseExcelTableDataProps {
  initialColumns: string[];
  initialRows: number;
  currentYear: number;
}

export interface ExcelTableMetrics {
  totalRevenue: number;
  customerCount: number;
  recurringIncome: number;
}

export const useExcelTableData = ({ 
  initialColumns, 
  initialRows,
  currentYear
}: UseExcelTableDataProps) => {
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [rowLabels, setRowLabels] = useState<string[]>([]);
  const [isDeletingRow, setIsDeletingRow] = useState(false);
  
  // Load data from localStorage on initial mount
  useEffect(() => {
    const savedData = localStorage.getItem('excelTableData');
    const savedColumns = localStorage.getItem('excelTableColumns');
    const savedRowLabels = localStorage.getItem('excelTableRowLabels');
    
    if (savedData && savedColumns && savedRowLabels) {
      try {
        // Parse saved data
        const parsedData = JSON.parse(savedData);
        const parsedColumns = JSON.parse(savedColumns);
        const parsedRowLabels = JSON.parse(savedRowLabels);
        
        setData(parsedData);
        setColumns(parsedColumns);
        setRowLabels(parsedRowLabels);
      } catch (error) {
        console.error('Error parsing saved Excel data:', error);
        initializeDefaultData();
      }
    } else {
      // If no saved data, initialize with defaults
      initializeDefaultData();
    }
  }, [initialRows, initialColumns]);
  
  // Initialize default data if no saved data exists
  const initializeDefaultData = useCallback(() => {
    const labels = Array.from({ length: initialRows }, (_, i) => `Row ${i + 1}`);
    setRowLabels(labels);
    
    const initialData: Record<string, Record<string, string>> = {};
    labels.forEach(row => {
      initialData[row] = {};
      columns.forEach(col => {
        initialData[row][col] = '';
      });
    });
    setData(initialData);
  }, [initialRows, initialColumns, columns]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('excelTableData', JSON.stringify(data));
    }
  }, [data]);
  
  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem('excelTableColumns', JSON.stringify(columns));
    }
  }, [columns]);
  
  // Save row labels to localStorage whenever they change
  useEffect(() => {
    if (rowLabels.length > 0 && !isDeletingRow) {
      localStorage.setItem('excelTableRowLabels', JSON.stringify(rowLabels));
    }
  }, [rowLabels, isDeletingRow]);
  
  const handleCellChange = useCallback((row: string, col: string, value: string) => {
    // Ensure the row exists in data
    const newData = { ...data };
    if (!newData[row]) {
      newData[row] = {};
    }
    
    // Update cell value and persist immediately
    newData[row][col] = value;
    setData(newData);
    
    // Immediately save to localStorage for persistence
    localStorage.setItem('excelTableData', JSON.stringify(newData));
  }, [data]);
  
  const handleRowLabelChange = useCallback((oldLabel: string, newLabel: string) => {
    if (oldLabel === newLabel) return;
    
    // First update row labels without triggering flickering
    const newRowLabels = rowLabels.map(label => 
      label === oldLabel ? newLabel : label
    );
    
    // Then update data with the new label
    const newData = { ...data };
    if (newData[oldLabel]) {
      newData[newLabel] = { ...newData[oldLabel] };
      delete newData[oldLabel];
    }
    
    // Batch updates to prevent flickering
    setRowLabels(newRowLabels);
    setData(newData);
    
    // Update local storage in one go
    localStorage.setItem('excelTableRowLabels', JSON.stringify(newRowLabels));
    localStorage.setItem('excelTableData', JSON.stringify(newData));
  }, [rowLabels, data]);
  
  const addRow = useCallback(() => {
    const newRowLabel = `Row ${rowLabels.length + 1}`;
    const newRowLabels = [...rowLabels, newRowLabel];
    
    // Update data with new row
    const newData = { ...data };
    newData[newRowLabel] = {};
    columns.forEach(col => {
      newData[newRowLabel][col] = '';
    });
    
    // Batch updates
    setRowLabels(newRowLabels);
    setData(newData);
    
    // Update localStorage
    localStorage.setItem('excelTableRowLabels', JSON.stringify(newRowLabels));
    localStorage.setItem('excelTableData', JSON.stringify(newData));
  }, [rowLabels, columns, data]);

  const deleteRow = useCallback((rowLabel: string) => {
    // Set deleting flag to prevent flicker
    setIsDeletingRow(true);
    
    // Update row labels and data
    const newRowLabels = rowLabels.filter(label => label !== rowLabel);
    const newData = { ...data };
    delete newData[rowLabel];
    
    // Batch updates
    setRowLabels(newRowLabels);
    setData(newData);
    
    // Update localStorage
    localStorage.setItem('excelTableRowLabels', JSON.stringify(newRowLabels));
    localStorage.setItem('excelTableData', JSON.stringify(newData));
    
    // Reset deleting flag after a short delay
    setTimeout(() => {
      setIsDeletingRow(false);
    }, 100);
  }, [rowLabels, data]);
  
  const getNextColumnName = useCallback(() => {
    const last = columns[columns.length - 1];
    if (last.length === 1 && last < 'Z') {
      return String.fromCharCode(last.charCodeAt(0) + 1);
    } else if (last === 'Z') {
      return 'AA';
    } else if (last.length > 1) {
      const lastChar = last[last.length - 1];
      const prefix = last.slice(0, -1);
      if (lastChar < 'Z') {
        return prefix + String.fromCharCode(lastChar.charCodeAt(0) + 1);
      } else {
        return prefix + 'A' + 'A';
      }
    }
    return 'A';
  }, [columns]);
  
  const addColumn = useCallback(() => {
    const newColumn = getNextColumnName();
    const newColumns = [...columns, newColumn];
    
    // Update data with new column
    const newData = { ...data };
    rowLabels.forEach(row => {
      if (!newData[row]) newData[row] = {};
      newData[row][newColumn] = '';
    });
    
    // Batch updates
    setColumns(newColumns);
    setData(newData);
    
    // Update localStorage
    localStorage.setItem('excelTableColumns', JSON.stringify(newColumns));
    localStorage.setItem('excelTableData', JSON.stringify(newData));
  }, [columns, rowLabels, data, getNextColumnName]);
  
  // Calculate row totals
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    rowLabels.forEach(row => {
      totals[row] = columns.reduce((sum, col) => {
        const value = data[row]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    });
    
    return totals;
  }, [data, rowLabels, columns]);
  
  // Calculate column totals
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    columns.forEach(col => {
      totals[col] = rowLabels.reduce((sum, row) => {
        const value = data[row]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    });
    
    totals['grand'] = Object.values(totals).reduce((sum, value) => sum + value, 0);
    
    return totals;
  }, [data, rowLabels, columns]);
  
  // Format column headers with year
  const columnHeaders = useMemo(() => {
    return columns.map(col => `${col} '${currentYear}`);
  }, [columns, currentYear]);
  
  // Calculate revenue metrics
  const tableMetrics = useMemo(() => {
    // Sum all numeric values in the table for total revenue
    let totalRevenue = 0;
    let recurringIncome = 0;
    
    // First row might be recurring income (monthly fees)
    if (rowLabels.length > 0) {
      const firstRow = rowLabels[0];
      recurringIncome = columns.reduce((sum, col) => {
        const value = data[firstRow]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    }
    
    // Total of all cells is total revenue
    for (const row of rowLabels) {
      totalRevenue += columns.reduce((sum, col) => {
        const value = data[row]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    }
    
    // Count non-empty rows as customers
    const customerCount = rowLabels.filter(row => 
      columns.some(col => data[row]?.[col] && data[row][col] !== '')
    ).length;
    
    return {
      totalRevenue,
      customerCount,
      recurringIncome
    };
  }, [data, rowLabels, columns]);
  
  return {
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
    tableMetrics
  };
};
