import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExcelEditableCell from './ExcelEditableCell';

interface ExcelLikeTableProps {
  initialColumns?: string[];
  initialRows?: number;
  className?: string;
  currentYear?: number;
}

const ExcelLikeTable: React.FC<ExcelLikeTableProps> = ({
  initialColumns = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  initialRows = 10,
  className,
  currentYear = new Date().getFullYear() % 100 // Default to current year (last 2 digits)
}) => {
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
  
  const addColumn = () => {
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
  
  const exportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "," + columns.map(col => `${col} '${currentYear}`).join(",") + ",Total\n";
    
    rowLabels.forEach(row => {
      let rowData = row;
      let rowTotal = 0;
      
      columns.forEach(col => {
        const cellValue = data[row][col] || "";
        const numericValue = isNaN(Number(cellValue)) ? 0 : Number(cellValue);
        rowData += "," + numericValue;
        rowTotal += numericValue;
      });
      
      rowData += "," + rowTotal;
      csvContent += rowData + "\n";
    });
    
    let totalRow = "Total";
    let grandTotal = 0;
    
    columns.forEach(col => {
      const colTotal = rowLabels.reduce((sum, row) => {
        const cellValue = data[row][col] || "";
        return sum + (isNaN(Number(cellValue)) ? 0 : Number(cellValue));
      }, 0);
      
      totalRow += "," + colTotal;
      grandTotal += colTotal;
    });
    
    totalRow += "," + grandTotal;
    csvContent += totalRow + "\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "excel_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
  
  const columnHeaders = useMemo(() => {
    return columns.map(col => `${col} '${currentYear}`);
  }, [columns, currentYear]);
  
  return (
    <div className={className}>
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <Button onClick={addRow} variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Add Row</span>
          </Button>
          <Button onClick={addColumn} variant="outline" size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Add Column</span>
          </Button>
        </div>
        <div className="space-x-2">
          <Button onClick={exportCsv} variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="border rounded">
          <Table className="w-auto min-w-full">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-40 font-bold">&nbsp;</TableHead>
                {columns.map((col, index) => (
                  <TableHead key={col} className="min-w-32 font-bold text-center">
                    {col} '{currentYear}
                  </TableHead>
                ))}
                <TableHead className="min-w-32 font-bold text-center bg-muted/20">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowLabels.map(row => (
                <TableRow key={row} className="h-10">
                  <TableCell className="p-0 sticky left-0">
                    <ExcelEditableCell
                      value={row}
                      onChange={(newLabel) => handleRowLabelChange(row, newLabel)}
                      isHeader={true}
                      isCurrency={false}
                    />
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={`${row}-${col}`} className="p-0 border">
                      <ExcelEditableCell
                        value={data[row]?.[col] || ''}
                        onChange={(value) => handleCellChange(row, col, value)}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="p-0 border bg-muted/10">
                    <ExcelEditableCell
                      value={rowTotals[row] || 0}
                      onChange={() => {}} // Read-only, can't edit totals
                      isHeader={true}
                      readOnly={true}
                      isTotal={true}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="h-10 bg-muted/10 font-bold">
                <TableCell className="p-0 sticky left-0">
                  <ExcelEditableCell
                    value="Total"
                    onChange={() => {}} // Read-only
                    isHeader={true}
                    readOnly={true}
                    isCurrency={false}
                  />
                </TableCell>
                {columns.map(col => (
                  <TableCell key={`total-${col}`} className="p-0 border">
                    <ExcelEditableCell
                      value={columnTotals[col] || 0}
                      onChange={() => {}} // Read-only
                      isHeader={true}
                      readOnly={true}
                      isTotal={true}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-0 border bg-muted/30">
                  <ExcelEditableCell
                    value={columnTotals['grand'] || 0}
                    onChange={() => {}} // Read-only
                    isHeader={true}
                    readOnly={true}
                    isTotal={true}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExcelLikeTable;
