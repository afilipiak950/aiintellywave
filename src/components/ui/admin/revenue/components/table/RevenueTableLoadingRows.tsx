
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';
import { Loader2 } from 'lucide-react';

interface RevenueTableLoadingRowsProps {
  monthColumns: MonthColumn[];
}

const RevenueTableLoadingRows: React.FC<RevenueTableLoadingRowsProps> = ({
  monthColumns
}) => {
  return (
    <TableRow>
      <TableCell 
        colSpan={monthColumns.length + 2} 
        className="h-24 text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Lade Umsatzdaten...</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableLoadingRows;
