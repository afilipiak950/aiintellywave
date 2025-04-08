
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExcelEditableCell from './ExcelEditableCell';

interface ExcelLikeTableProps {
  initialColumns?: string[];
  initialRows?: number;
  className?: string;
}

const ExcelLikeTable: React.FC<ExcelLikeTableProps> = ({
  initialColumns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
  initialRows = 10,
  className
}) => {
  // State for table data
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [columns, setColumns] = useState<string[]>(initialColumns);
  const [rowLabels, setRowLabels] = useState<string[]>([]);
  
  // Initialize rows
  useEffect(() => {
    const labels = Array.from({ length: initialRows }, (_, i) => `Row ${i + 1}`);
    setRowLabels(labels);
    
    // Initialize empty data structure
    const initialData: Record<string, Record<string, string>> = {};
    labels.forEach(row => {
      initialData[row] = {};
      columns.forEach(col => {
        initialData[row][col] = '';
      });
    });
    setData(initialData);
  }, [initialRows, columns]);
  
  // Handle cell value change
  const handleCellChange = (row: string, col: string, value: string) => {
    setData(prev => ({
      ...prev,
      [row]: {
        ...prev[row],
        [col]: value
      }
    }));
  };
  
  // Add a new row
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
  
  // Add a new column
  const addColumn = () => {
    // Use Excel-like column naming (A, B, ..., Z, AA, AB, etc.)
    const getNextColumnName = () => {
      const last = columns[columns.length - 1];
      // Simple implementation for A-Z columns
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
  
  // Export as CSV
  const exportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header row
    csvContent += "," + columns.join(",") + "\n";
    
    // Data rows
    rowLabels.forEach(row => {
      let rowData = row;
      columns.forEach(col => {
        rowData += "," + (data[row][col] || "").replace(/,/g, ";"); // Replace commas in data
      });
      csvContent += rowData + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "excel_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
                {columns.map(col => (
                  <TableHead key={col} className="min-w-32 font-bold text-center">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowLabels.map(row => (
                <TableRow key={row} className="h-10">
                  <TableCell className="font-medium bg-muted/50 sticky left-0">
                    {row}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={`${row}-${col}`} className="p-0 border">
                      <ExcelEditableCell
                        value={data[row]?.[col] || ''}
                        onChange={(value) => handleCellChange(row, col, value)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExcelLikeTable;
