
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueTableLoadingRowsProps {
  monthColumns: MonthColumn[];
}

const RevenueTableLoadingRows: React.FC<RevenueTableLoadingRowsProps> = ({ monthColumns }) => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((index) => (
        <TableRow key={`loading-${index}`}>
          <TableCell className="sticky left-0 bg-white">
            <Skeleton className="h-5 w-20" />
          </TableCell>
          
          {monthColumns.map((col, colIndex) => (
            <TableCell key={`loading-${index}-${colIndex}`}>
              <Skeleton className="h-5 w-16" />
            </TableCell>
          ))}
          
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default RevenueTableLoadingRows;
