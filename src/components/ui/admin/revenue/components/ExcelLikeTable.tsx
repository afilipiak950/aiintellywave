
import React from 'react';
import { Table } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExcelTableData } from './table-utils/useExcelTableData';
import { exportTableToCsv } from './table-utils/exportUtils';
import ExcelTableHeader from './excel-table/ExcelTableHeader';
import ExcelTableRows from './excel-table/ExcelTableRows';
import ExcelTableToolbar from './excel-table/ExcelTableToolbar';

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
    columnHeaders
  } = useExcelTableData({
    initialColumns,
    initialRows,
    currentYear
  });
  
  const exportCsv = () => {
    exportTableToCsv(
      columns,
      rowLabels,
      data,
      columnTotals,
      rowTotals,
      currentYear
    );
  };
  
  return (
    <div className={className}>
      <ExcelTableToolbar
        addRow={addRow}
        addColumn={addColumn}
        exportCsv={exportCsv}
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
