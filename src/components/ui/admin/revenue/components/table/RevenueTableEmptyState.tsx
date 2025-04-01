
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableEmptyStateProps {
  monthColumns: MonthColumn[];
}

const RevenueTableEmptyState: React.FC<RevenueTableEmptyStateProps> = ({ monthColumns }) => {
  return (
    <TableRow>
      <TableCell colSpan={monthColumns.length + 2} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <p className="text-sm text-muted-foreground">No customers or revenue data available</p>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableEmptyState;
