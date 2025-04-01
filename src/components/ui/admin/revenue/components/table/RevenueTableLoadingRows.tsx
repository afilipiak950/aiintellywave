
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableLoadingRowsProps {
  monthColumns: MonthColumn[];
  rowCount?: number;
}

const RevenueTableLoadingRows: React.FC<RevenueTableLoadingRowsProps> = ({ 
  monthColumns, 
  rowCount = 5 
}) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, idx) => (
        <TableRow key={idx} className="h-7">
          <TableCell className="sticky left-0 bg-white py-1">
            <Skeleton className="h-4 w-32" />
          </TableCell>
          
          {monthColumns.map((col) => (
            <TableCell key={`loading-${idx}-${col.year}-${col.month}`} className="py-1">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
          
          <TableCell className="py-1">
            <Skeleton className="h-4 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default RevenueTableLoadingRows;
