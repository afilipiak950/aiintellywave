
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueTableLoadingRowsProps {
  monthColumns: MonthColumn[];
}

const RevenueTableLoadingRows: React.FC<RevenueTableLoadingRowsProps> = ({
  monthColumns
}) => {
  // Create multiple skeleton rows for better loading UX
  return (
    <>
      {[1, 2, 3].map((index) => (
        <TableRow key={`loading-row-${index}`}>
          <TableCell className="sticky left-0 bg-white w-40">
            <Skeleton className="h-4 w-32 my-1" />
          </TableCell>
          
          {monthColumns.map((col, colIndex) => (
            <TableCell key={`loading-cell-${index}-${colIndex}`} className="p-1">
              <div className="flex flex-col space-y-1 w-full">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
              </div>
            </TableCell>
          ))}
          
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
        </TableRow>
      ))}
      
      <TableRow>
        <TableCell 
          colSpan={monthColumns.length + 2} 
          className="h-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Lade Umsatzdaten...</span>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
};

export default RevenueTableLoadingRows;
