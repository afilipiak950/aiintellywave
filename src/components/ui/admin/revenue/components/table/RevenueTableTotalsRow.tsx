
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
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
  // Calculate grand total
  const grandTotal = Object.values(monthlyTotals).reduce(
    (sum, month) => sum + month.total_revenue, 
    0
  );

  return (
    <TableRow className="font-bold bg-muted/20">
      <TableCell className="sticky left-0 bg-muted/20 py-1 text-sm">
        TOTAL
      </TableCell>
      
      {monthColumns.map((col) => {
        const key = `${col.year}-${col.month}`;
        const monthTotal = monthlyTotals[key]?.total_revenue || 0;
        
        // Check if any customer has updates for this month
        const hasUpdatesInMonth = Object.keys(updatedFields).some(
          fieldKey => fieldKey.includes(`-${col.year}-${col.month}`)
        );
        
        return (
          <TableCell key={key} className="text-right py-1">
            {hasUpdatesInMonth ? (
              <motion.div
                initial={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                animate={{ backgroundColor: "rgba(34, 197, 94, 0)" }}
                transition={{ duration: 2 }}
                className="px-2 py-1 rounded"
              >
                {new Intl.NumberFormat('de-DE', { 
                  style: 'currency', 
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 
                }).format(monthTotal)}
              </motion.div>
            ) : (
              new Intl.NumberFormat('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(monthTotal)
            )}
          </TableCell>
        );
      })}
      
      <TableCell className="text-right py-1">
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
