
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface UseExcelTableDataProps {
  initialColumns: string[];
  initialRows: number;
  currentYear: number;
}

export interface ExcelTableMetrics {
  totalRevenue: number;
  customerCount: number;
  recurringIncome: number;
  setupRevenue: number;
  appointmentsCount: number;
  appointmentRevenue: number;
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
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  
  // Ref to detect if we're initializing data from database
  const initializingFromDbRef = useRef(true);
  const dataUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize with default data if not using database
  const initializeDefaultData = useCallback(() => {
    const defaultRowLabels = [
      "Monthly Recurring Fee",
      "Appointments",
      "Price per Appointment",
      "Setup Fee",
      "Customer 1",
      "Customer 2",
      "Customer 3",
      "Customer 4",
      "Customer 5",
      "Customer 6"
    ].slice(0, initialRows);
    
    setRowLabels(defaultRowLabels);
    
    const initialData: Record<string, Record<string, string>> = {};
    defaultRowLabels.forEach(row => {
      initialData[row] = {};
      columns.forEach(col => {
        initialData[row][col] = '';
      });
    });
    setData(initialData);
    setIsDataInitialized(true);
    initializingFromDbRef.current = false;
  }, [initialRows, initialColumns, columns]);
  
  // Load data from localStorage on initial mount if not using database
  useEffect(() => {
    if (isDataInitialized || !initializingFromDbRef.current) return;
    
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
        setIsDataInitialized(true);
        initializingFromDbRef.current = false;
      } catch (error) {
        console.error('Error parsing saved Excel data:', error);
        initializeDefaultData();
      }
    } else {
      // If no saved data, initialize with defaults
      initializeDefaultData();
    }
  }, [initialRows, initialColumns, initializeDefaultData, isDataInitialized]);
  
  // Function to initialize with data from database
  const initializeWithData = useCallback((
    dbColumns: string[],
    dbRowLabels: string[],
    dbData: Record<string, Record<string, string>>
  ) => {
    // Set init flag to prevent immediate save after load
    initializingFromDbRef.current = true;
    
    console.log('Initializing Excel data from database:', { 
      columns: dbColumns, 
      rowLabels: dbRowLabels, 
      data: dbData 
    });
    
    // Batch updates to prevent flickering
    const updates: (() => void)[] = [];
    
    if (dbColumns && dbColumns.length > 0) {
      updates.push(() => setColumns(dbColumns));
    } else {
      updates.push(() => setColumns(initialColumns));
    }
    
    if (dbRowLabels && dbRowLabels.length > 0) {
      updates.push(() => setRowLabels(dbRowLabels));
    } else {
      // Use default labels if none provided
      const defaultRowLabels = [
        "Monthly Recurring Fee",
        "Appointments",
        "Price per Appointment",
        "Setup Fee",
        "Customer 1",
        "Customer 2",
        "Customer 3",
        "Customer 4",
        "Customer 5",
        "Customer 6"
      ].slice(0, initialRows);
      updates.push(() => setRowLabels(defaultRowLabels));
    }
    
    if (dbData && Object.keys(dbData).length > 0) {
      updates.push(() => setData(dbData));
    } else {
      // Initialize empty data
      const initialData: Record<string, Record<string, string>> = {};
      const labels = dbRowLabels.length > 0 ? dbRowLabels : rowLabels;
      const cols = dbColumns.length > 0 ? dbColumns : initialColumns;
      
      labels.forEach(row => {
        initialData[row] = {};
        cols.forEach(col => {
          initialData[row][col] = '';
        });
      });
      updates.push(() => setData(initialData));
    }
    
    // Apply all updates in a sequence with minimal delay
    let delay = 0;
    updates.forEach(update => {
      setTimeout(update, delay);
      delay += 10;
    });
    
    setTimeout(() => {
      setIsDataInitialized(true);
      // After data is initialized, allow saving changes
      setTimeout(() => {
        initializingFromDbRef.current = false;
      }, 500);
    }, delay);
  }, [initialColumns, initialRows, rowLabels]);
  
  // Function to get serializable data (for saving to database)
  const getSerializableData = useCallback(() => {
    return data;
  }, [data]);
  
  // Save data to localStorage whenever it changes, with debounce
  useEffect(() => {
    if (!isDataInitialized || initializingFromDbRef.current) return;
    
    if (Object.keys(data).length > 0) {
      // Clear existing timeout
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
      }
      
      // Set new timeout for debounced storage
      dataUpdateTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('excelTableData', JSON.stringify(data));
      }, 500);
    }
    
    return () => {
      if (dataUpdateTimeoutRef.current) {
        clearTimeout(dataUpdateTimeoutRef.current);
      }
    };
  }, [data, isDataInitialized]);
  
  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (!isDataInitialized || initializingFromDbRef.current) return;
    
    if (columns.length > 0) {
      localStorage.setItem('excelTableColumns', JSON.stringify(columns));
    }
  }, [columns, isDataInitialized]);
  
  // Save row labels to localStorage whenever they change
  useEffect(() => {
    if (!isDataInitialized || isDeletingRow || initializingFromDbRef.current) return;
    
    if (rowLabels.length > 0) {
      localStorage.setItem('excelTableRowLabels', JSON.stringify(rowLabels));
    }
  }, [rowLabels, isDeletingRow, isDataInitialized]);
  
  // Handle cell changes with batched updates to prevent flickering
  const handleCellChange = useCallback((row: string, col: string, value: string) => {
    // Ensure the row exists in data, create deep copy to avoid reference issues
    setData(prevData => {
      const newData = { ...prevData };
      if (!newData[row]) {
        newData[row] = {};
      }
      
      if (newData[row][col] === value) {
        return prevData; // No change needed
      }
      
      // Update specific cell only
      newData[row] = { ...newData[row], [col]: value };
      return newData;
    });
  }, []);
  
  // Handle row label changes with prevention of flickering
  const handleRowLabelChange = useCallback((oldLabel: string, newLabel: string) => {
    if (oldLabel === newLabel) return;
    
    // Update in a single batch to prevent flickering
    setRowLabels(prevLabels => 
      prevLabels.map(label => label === oldLabel ? newLabel : label)
    );
    
    setData(prevData => {
      const newData = { ...prevData };
      if (newData[oldLabel]) {
        newData[newLabel] = { ...newData[oldLabel] };
        delete newData[oldLabel];
      }
      return newData;
    });
  }, []);
  
  // Add row with optimized rendering
  const addRow = useCallback(() => {
    const newRowLabel = `Customer ${rowLabels.length + 1}`;
    
    setRowLabels(prevLabels => [...prevLabels, newRowLabel]);
    
    setData(prevData => {
      const newData = { ...prevData };
      newData[newRowLabel] = {};
      columns.forEach(col => {
        newData[newRowLabel][col] = '';
      });
      return newData;
    });
  }, [rowLabels, columns]);

  // Delete row with prevention of flickering
  const deleteRow = useCallback((rowLabel: string) => {
    // Set deleting flag to prevent flickering state updates
    setIsDeletingRow(true);
    
    // Update in a single batch to prevent flickering
    setRowLabels(prevLabels => prevLabels.filter(label => label !== rowLabel));
    
    setData(prevData => {
      const newData = { ...prevData };
      delete newData[rowLabel];
      return newData;
    });
    
    // Reset deleting flag after a short delay
    setTimeout(() => {
      setIsDeletingRow(false);
    }, 100);
  }, []);
  
  // Generate next column name in sequence
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
  
  // Add column with optimized rendering
  const addColumn = useCallback(() => {
    const newColumn = getNextColumnName();
    
    setColumns(prevColumns => [...prevColumns, newColumn]);
    
    setData(prevData => {
      const newData = { ...prevData };
      rowLabels.forEach(row => {
        if (!newData[row]) newData[row] = {};
        newData[row] = { ...newData[row], [newColumn]: '' };
      });
      return newData;
    });
  }, [getNextColumnName, rowLabels]);
  
  // Calculate row totals with memoization to prevent unnecessary recalculations
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
  
  // Calculate column totals with memoization
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
  
  // Calculate revenue metrics with memoization
  const tableMetrics = useMemo(() => {
    // Find specific row indexes for metrics calculation
    const recurringFeeRowIndex = rowLabels.findIndex(label => 
      label.toLowerCase().includes('recurring') || label.toLowerCase().includes('monthly fee'));
    
    const appointmentsRowIndex = rowLabels.findIndex(label => 
      label.toLowerCase().includes('appointment') && !label.toLowerCase().includes('price'));
    
    const pricePerAppointmentRowIndex = rowLabels.findIndex(label => 
      label.toLowerCase().includes('price per appointment'));
    
    const setupFeeRowIndex = rowLabels.findIndex(label => 
      label.toLowerCase().includes('setup fee'));
    
    // Calculate metrics based on specific rows if they exist
    let recurringIncome = 0;
    let appointmentsCount = 0;
    let appointmentRevenue = 0;
    let setupRevenue = 0;
    
    // If we have a recurring fee row, sum it across columns
    if (recurringFeeRowIndex >= 0) {
      const recurringFeeRow = rowLabels[recurringFeeRowIndex];
      recurringIncome = columns.reduce((sum, col) => {
        const value = data[recurringFeeRow]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    }
    
    // If we have both appointments and price per appointment rows
    if (appointmentsRowIndex >= 0 && pricePerAppointmentRowIndex >= 0) {
      const appointmentsRow = rowLabels[appointmentsRowIndex];
      const priceRow = rowLabels[pricePerAppointmentRowIndex];
      
      columns.forEach(col => {
        const appointments = Number(data[appointmentsRow]?.[col] || 0);
        const price = Number(data[priceRow]?.[col] || 0);
        
        if (!isNaN(appointments)) appointmentsCount += appointments;
        if (!isNaN(appointments) && !isNaN(price)) {
          appointmentRevenue += appointments * price;
        }
      });
    }
    
    // If we have a setup fee row
    if (setupFeeRowIndex >= 0) {
      const setupFeeRow = rowLabels[setupFeeRowIndex];
      setupRevenue = columns.reduce((sum, col) => {
        const value = data[setupFeeRow]?.[col] || '';
        return sum + (isNaN(Number(value)) ? 0 : Number(value));
      }, 0);
    }
    
    // Count customer rows as those that don't have special names
    const specialRows = ['Monthly Recurring Fee', 'Appointments', 'Price per Appointment', 'Setup Fee'];
    const customerCount = rowLabels.filter(row => 
      !specialRows.some(special => row.toLowerCase().includes(special.toLowerCase())) &&
      columns.some(col => data[row]?.[col] && data[row][col] !== '')
    ).length;
    
    // Sum of all values = total revenue
    const totalRevenue = recurringIncome + appointmentRevenue + setupRevenue;
    
    return {
      totalRevenue,
      customerCount,
      recurringIncome,
      setupRevenue,
      appointmentsCount,
      appointmentRevenue
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
    tableMetrics,
    initializeWithData,
    getSerializableData
  };
};
