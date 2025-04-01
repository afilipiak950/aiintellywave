
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableEmptyStateProps {
  monthColumns: MonthColumn[];
}

const RevenueTableEmptyState: React.FC<RevenueTableEmptyStateProps> = ({ monthColumns }) => {
  return (
    <TableRow>
      <TableCell colSpan={monthColumns.length + 2} className="h-24 text-center text-sm">
        No revenue data found. Start by adding customers using the "Add Customer" button.
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableEmptyState;
