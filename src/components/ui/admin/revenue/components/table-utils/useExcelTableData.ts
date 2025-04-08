
import { useState, useEffect, useMemo } from 'react';

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
  const initializeDefaultData = () => {
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
  };
  
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
    if (rowLabels.length > 0) {
      localStorage.setItem('excelTableRowLabels', JSON.stringify(rowLabels));
    }
  }, [rowLabels]);
  
  const handleCellChange = (row: string, col: string, value: string) => {
    setData(prev => ({
      ...prev,
      [row]: {
        ...prev[row],
        [col]: value
      }
    }));
  };
  
  const handleRowLabelChange = (oldLabel: string, newLabel: string) => {
    if (oldLabel === newLabel) return;
    
    setRowLabels(prev => prev.map(label => label === oldLabel ? newLabel : label));
    
    setData(prev => {
      const newData = { ...prev };
      if (newData[oldLabel]) {
        newData[newLabel] = { ...newData[oldLabel] };
        delete newData[oldLabel];
      }
      return newData;
    });
  };
  
  const addRow = () => {
    const newRowLabel = `Row ${rowLabels.length + 1}`;
    setRowLabels([...rowLabels, newRowLabel]);
    
    setData(prev => {
      const newData = { ...prev };
      newData[newRowLabel] = {};
      columns.forEach(col => {
        newData[newRowLabel][col] = '';
      });
      return newData;
    });
  };

  const deleteRow = (rowLabel: string) => {
    setRowLabels(prev => prev.filter(label => label !== rowLabel));
    
    setData(prev => {
      const newData = { ...prev };
      delete newData[rowLabel];
      return newData;
    });
  };
  
  const getNextColumnName = () => {
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
  };
  
  const addColumn = () => {
    const newColumn = getNextColumnName();
    setColumns([...columns, newColumn]);
    
    setData(prev => {
      const newData = { ...prev };
      rowLabels.forEach(row => {
        if (!newData[row]) newData[row] = {};
        newData[row][newColumn] = '';
      });
      return newData;
    });
  };
  
  // Calculate row totals
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    rowLabels.forEach(row => {
      totals[row] = columns.reduce((sum, col) => {
        const value = data[row][col] || '';
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
        const value = data[row][col] || '';
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
