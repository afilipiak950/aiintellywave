
import { useState, useEffect, useMemo } from 'react';

interface UseExcelTableDataProps {
  initialColumns: string[];
  initialRows: number;
  currentYear: number;
}

export const useExcelTableData = ({ 
  initialColumns, 
  initialRows,
  currentYear
}: UseExcelTableDataProps) => {
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [rowLabels, setRowLabels] = useState<string[]>([]);
  
  useEffect(() => {
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
  }, [initialRows, columns]);
  
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

  // New function to delete a row
  const deleteRow = (rowLabel: string) => {
    // Remove the row from rowLabels
    setRowLabels(prev => prev.filter(label => label !== rowLabel));
    
    // Remove the row data
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
  
  return {
    data,
    columns,
    rowLabels,
    handleCellChange,
    handleRowLabelChange,
    addRow,
    deleteRow, // Export the new function
    addColumn,
    rowTotals,
    columnTotals,
    columnHeaders
  };
};
