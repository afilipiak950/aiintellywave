
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
  // Calculate grand total
  const grandTotal = Object.values(monthlyTotals).reduce(
    (sum, month) => sum + month.total_revenue, 
    0
  );
  
  // Check if any month has been updated
  const hasAnyUpdates = Object.keys(updatedFields).length > 0;
  
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
        
        // Check if any of this month's fields were updated
        const isMonthUpdated = Object.keys(updatedFields).some(fieldKey => {
          return fieldKey.includes(`-${col.year}-${col.month}`);
        });
        
        return (
          <TableCell key={`total-${key}`} className="text-right py-1 text-xs">
            {isMonthUpdated ? (
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
                }).format(monthTotal.total_revenue)}
              </motion.div>
            ) : (
              new Intl.NumberFormat('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(monthTotal.total_revenue)
            )}
          </TableCell>
        );
      })}
      
      <TableCell className="text-right py-1 text-xs">
        {hasAnyUpdates ? (
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
            }).format(grandTotal)}
          </motion.div>
        ) : (
          new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          }).format(grandTotal)
        )}
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableTotalsRow;
