
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { MonthColumn } from '@/types/revenue';
import { motion } from 'framer-motion';

interface RevenueTableTotalsRowProps {
  monthColumns: MonthColumn[];
  monthlyTotals: Record<string, {
    setup_fee: number;
    appointments: number;
    recurring_fee: number;
    total_revenue: number;
  }>;
  updatedFields?: Record<string, string[]>;
}

const RevenueTableTotalsRow: React.FC<RevenueTableTotalsRowProps> = ({
  monthColumns,
  monthlyTotals,
  updatedFields = {}
}) => {
  // Calculate grand total across all months
  const grandTotal = monthColumns.reduce((sum, col) => {
    const key = `${col.year}-${col.month}`;
    if (monthlyTotals[key]) {
      return sum + monthlyTotals[key].total_revenue;
    }
    return sum;
  }, 0);
  
  return (
    <TableRow className="bg-muted/50">
      <TableCell className="sticky left-0 bg-muted/50 font-bold py-1 text-xs">
        Monatliche Umsätze
      </TableCell>
      
      {monthColumns.map((col) => {
        const key = `${col.year}-${col.month}`;
        const total = monthlyTotals[key]?.total_revenue || 0;
        
        return (
          <TableCell 
            key={key}
            className="text-right font-bold py-1 text-xs"
          >
            {new Intl.NumberFormat('de-DE', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(total)}
          </TableCell>
        );
      })}
      
      <TableCell className="text-right font-bold py-1 text-xs">
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
