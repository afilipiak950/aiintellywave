
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
  const initializingFromDbRef = useRef(false);
  
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
  }, [initialRows, initialColumns, columns]);
  
  // Load data from localStorage on initial mount if not using database
  useEffect(() => {
    if (isDataInitialized || initializingFromDbRef.current) return;
    
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
    initializingFromDbRef.current = true;
    
    console.log('Initializing Excel data from database:', { 
      columns: dbColumns, 
      rowLabels: dbRowLabels, 
      data: dbData 
    });
    
    if (dbColumns && dbColumns.length > 0) {
      setColumns(dbColumns);
    } else {
      setColumns(initialColumns);
    }
    
    if (dbRowLabels && dbRowLabels.length > 0) {
      setRowLabels(dbRowLabels);
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
      setRowLabels(defaultRowLabels);
    }
    
    if (dbData && Object.keys(dbData).length > 0) {
      setData(dbData);
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
      setData(initialData);
    }
    
    setIsDataInitialized(true);
    initializingFromDbRef.current = false;
  }, [initialColumns, initialRows, rowLabels]);
  
  // Function to get serializable data (for saving to database)
  const getSerializableData = useCallback(() => {
    return data;
  }, [data]);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isDataInitialized) return;
    
    if (Object.keys(data).length > 0) {
      localStorage.setItem('excelTableData', JSON.stringify(data));
    }
  }, [data, isDataInitialized]);
  
  // Save columns to localStorage whenever they change
  useEffect(() => {
    if (!isDataInitialized) return;
    
    if (columns.length > 0) {
      localStorage.setItem('excelTableColumns', JSON.stringify(columns));
    }
  }, [columns, isDataInitialized]);
  
  // Save row labels to localStorage whenever they change
  useEffect(() => {
    if (!isDataInitialized || isDeletingRow) return;
    
    if (rowLabels.length > 0) {
      localStorage.setItem('excelTableRowLabels', JSON.stringify(rowLabels));
    }
  }, [rowLabels, isDeletingRow, isDataInitialized]);
  
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
    const newRowLabel = `Customer ${rowLabels.length + 1}`;
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
