
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';

interface RevenueTableTotalsRowProps {
  monthColumns: MonthColumn[];
  monthlyTotals: Record<string, {
    setup_fee: number;
    appointments: number;
    recurring_fee: number;
    total_revenue: number;
  }>;
}

const RevenueTableTotalsRow: React.FC<RevenueTableTotalsRowProps> = ({
  monthColumns,
  monthlyTotals
}) => {
  // Calculate grand total
  const grandTotal = Object.values(monthlyTotals).reduce(
    (sum, month) => sum + month.total_revenue, 
    0
  );
  
  return (
    <TableRow className="bg-muted font-bold border-t-2 border-border h-8">
      <TableCell className="sticky left-0 bg-muted py-1 text-xs">TOTAL</TableCell>
      
      {monthColumns.map((col) => {
        const key = `${col.year}-${col.month}`;
        const monthTotal = monthlyTotals[key] || {
          setup_fee: 0,
          appointments: 0, 
          recurring_fee: 0,
          total_revenue: 0
        };
        
        return (
          <TableCell key={`total-${key}`} className="text-right py-1 text-xs">
            {new Intl.NumberFormat('de-DE', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(monthTotal.total_revenue)}
          </TableCell>
        );
      })}
      
      <TableCell className="text-right py-1 text-xs">
        {new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        }).format(grandTotal)}
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableTotalsRow;
