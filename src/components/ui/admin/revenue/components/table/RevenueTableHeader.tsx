
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableHeaderProps {
  monthColumns: MonthColumn[];
}

const RevenueTableHeader: React.FC<RevenueTableHeaderProps> = ({
  monthColumns
}) => {
  // Get month names for the header
  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('de-DE', { month: 'short' });
  };

  return (
    <TableHeader className="sticky top-0 bg-background">
      <TableRow>
        <TableHead className="sticky left-0 bg-background font-bold z-10 w-[200px]">
          Kunde
        </TableHead>
        
        {monthColumns.map((col) => (
          <TableHead 
            key={`${col.year}-${col.month}`} 
            className="text-center font-bold py-2 text-xs min-w-[130px]"
          >
            {getMonthName(col.month)} {col.year}
          </TableHead>
        ))}
        
        <TableHead className="text-right font-bold py-2 text-xs min-w-[120px]">
          Gesamtumsatz
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default RevenueTableHeader;
