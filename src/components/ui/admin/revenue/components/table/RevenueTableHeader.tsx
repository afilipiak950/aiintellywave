
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableHeaderProps {
  monthColumns: MonthColumn[];
}

const RevenueTableHeader: React.FC<RevenueTableHeaderProps> = ({ monthColumns }) => {
  return (
    <TableHeader className="bg-muted/50 sticky top-0">
      <TableRow className="h-8">
        <TableHead className="w-[150px] min-w-[150px] sticky left-0 bg-muted/50 z-10 py-1 text-xs">
          Customer
        </TableHead>
        
        {monthColumns.map((col) => (
          <TableHead key={`${col.year}-${col.month}`} className="text-center min-w-[180px] py-1 text-xs">
            {col.label}
          </TableHead>
        ))}
        
        <TableHead className="text-center font-bold min-w-[80px] py-1 text-xs">
          Total
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default RevenueTableHeader;
