
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExcelTableHeaderProps {
  columns: string[];
  columnHeaders: string[];
  currentYear: number;
}

const ExcelTableHeader: React.FC<ExcelTableHeaderProps> = ({
  columns,
  columnHeaders,
  currentYear
}) => {
  return (
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
  );
};

export default ExcelTableHeader;
