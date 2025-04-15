
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useExcelTableDataStorage } from '@/hooks/revenue/use-excel-table-data-storage';
import { toast } from '@/hooks/use-toast';

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
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Referenz zur Verfolgung des ursprünglichen Labels beim Bearbeiten
  const originalLabelRef = useRef<string | null>(null);
  
  // Verwende das Storage-Hook
  const { loadExcelTableData, saveExcelTableData, loading: storageLoading } = useExcelTableDataStorage();
  
  // Erstelle eine debounced Save-Funktion
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const saveDataToDatabase = useCallback(async () => {
    if (Object.keys(data).length === 0 || rowLabels.length === 0) {
      return;
    }
    
    const tableData = {
      table_name: 'revenue',
      row_labels: rowLabels,
      columns: columns,
      data: data
    };
    
    await saveExcelTableData(tableData);
  }, [data, rowLabels, columns, saveExcelTableData]);
  
  // Debounced Save-Funktion
  const debouncedSaveData = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDataToDatabase();
    }, 500);
  }, [saveDataToDatabase]);
  
  // Lade Daten aus der Datenbank beim ersten Mount
  useEffect(() => {
    const fetchData = async () => {
      const savedData = await loadExcelTableData('revenue');
      
      if (savedData && savedData.row_labels && savedData.columns && savedData.data) {
        // Daten aus der Datenbank setzen
        setData(savedData.data);
        setColumns(savedData.columns);
        setRowLabels(savedData.row_labels);
        setIsInitialized(true);
      } else {
        // Initialisiere mit Standardwerten, wenn keine Daten gefunden wurden
        initializeDefaultData();
      }
    };
    
    fetchData();
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Daten beim Unmount des Komponenten speichern
        saveDataToDatabase();
      }
    };
  }, [loadExcelTableData, saveDataToDatabase]);
  
  // Initialize default data if no saved data exists
  const initializeDefaultData = useCallback(() => {
    const labels = Array.from({ length: initialRows }, (_, i) => `Row ${i + 1}`);
    setRowLabels(labels);
    
    const initialData: Record<string, Record<string, string>> = {};
    labels.forEach(row => {
      initialData[row] = {};
      initialColumns.forEach(col => {
        initialData[row][col] = '';
      });
    });
    setData(initialData);
    setIsInitialized(true);
    
    // Save default data to database
    setTimeout(() => {
      saveDataToDatabase();
    }, 500);
  }, [initialRows, initialColumns, saveDataToDatabase]);
  
  // Für Abwärtskompatibilität auch weiterhin im localStorage speichern
  useEffect(() => {
    if (Object.keys(data).length > 0 && isInitialized) {
      localStorage.setItem('excelTableData', JSON.stringify(data));
    }
  }, [data, isInitialized]);
  
  useEffect(() => {
    if (columns.length > 0 && isInitialized) {
      localStorage.setItem('excelTableColumns', JSON.stringify(columns));
    }
  }, [columns, isInitialized]);
  
  useEffect(() => {
    if (rowLabels.length > 0 && !isDeletingRow && isInitialized) {
      localStorage.setItem('excelTableRowLabels', JSON.stringify(rowLabels));
    }
  }, [rowLabels, isDeletingRow, isInitialized]);
  
  const handleCellChange = useCallback((row: string, col: string, value: string) => {
    // Ensure the row exists in data
    const newData = { ...data };
    if (!newData[row]) {
      newData[row] = {};
    }
    
    // Update cell value and persist immediately
    newData[row][col] = value;
    setData(newData);
    
    // Save to database (debounced)
    debouncedSaveData();
    
    // Immediately save to localStorage for persistence
    localStorage.setItem('excelTableData', JSON.stringify(newData));
  }, [data, debouncedSaveData]);
  
  const handleRowLabelChange = useCallback((oldLabel: string, newLabel: string) => {
    if (oldLabel === newLabel) return;
    
    // Verwende den Original-Label aus der Ref, um Flickering zu verhindern
    const originalLabel = originalLabelRef.current || oldLabel;
    originalLabelRef.current = null;

    // First update row labels without triggering flickering
    const newRowLabels = rowLabels.map(label => 
      label === originalLabel ? newLabel : label
    );
    
    // Then update data with the new label
    const newData = { ...data };
    if (newData[originalLabel]) {
      newData[newLabel] = { ...newData[originalLabel] };
      delete newData[originalLabel];
    }
    
    // Batch updates to prevent flickering
    setRowLabels(newRowLabels);
    setData(newData);
    
    // Update local storage in one go
    localStorage.setItem('excelTableRowLabels', JSON.stringify(newRowLabels));
    localStorage.setItem('excelTableData', JSON.stringify(newData));
    
    // Save to database
    debouncedSaveData();
  }, [rowLabels, data, debouncedSaveData]);
  
  // Handle row label edit start
  const handleRowLabelEditStart = useCallback((rowLabel: string) => {
    originalLabelRef.current = rowLabel;
  }, []);
  
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
    
    // Save to database
    debouncedSaveData();
  }, [rowLabels, columns, data, debouncedSaveData]);

  const deleteRow = useCallback((rowLabel: string) => {
    if (!window.confirm(`Sind Sie sicher, dass Sie die Zeile "${rowLabel}" löschen möchten?`)) {
      return;
    }
    
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
    
    // Save to database
    debouncedSaveData();
    
    // Reset deleting flag after a short delay
    setTimeout(() => {
      setIsDeletingRow(false);
    }, 100);
  }, [rowLabels, data, debouncedSaveData]);
  
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
    
    // Save to database
    debouncedSaveData();
  }, [columns, rowLabels, data, getNextColumnName, debouncedSaveData]);
  
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
    handleRowLabelEditStart,
    addRow,
    deleteRow,
    addColumn,
    rowTotals,
    columnTotals,
    columnHeaders,
    tableMetrics,
    loading: storageLoading
  };
};
