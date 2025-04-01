
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import RevenueTableCell from './RevenueTableCell';
import { CustomerRevenueRow, MonthColumn } from '@/types/revenue';
import { motion } from 'framer-motion';

interface RevenueTableCustomerRowProps {
  row: CustomerRevenueRow;
  monthColumns: MonthColumn[];
  handleCellUpdate: (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => void;
  updatedFields?: Record<string, string[]>;
}

const RevenueTableCustomerRow: React.FC<RevenueTableCustomerRowProps> = ({
  row,
  monthColumns,
  handleCellUpdate,
  updatedFields = {}
}) => {
  // Calculate customer total across all months
  const customerTotal = monthColumns.reduce((sum, col) => {
    const key = `${col.year}-${col.month}`;
    const monthData = row.months[key];
    if (!monthData) return sum;
    
    return sum + 
      (monthData.setup_fee || 0) +
      ((monthData.price_per_appointment || 0) * (monthData.appointments_delivered || 0)) +
      (monthData.recurring_fee || 0);
  }, 0);

  // Check if any fields for this customer have been updated
  const hasUpdates = Object.keys(updatedFields).some(key => 
    key.startsWith(row.customer_id)
  );
  
  return (
    <TableRow key={row.customer_id} className={`hover:bg-muted/50 h-auto ${hasUpdates ? 'bg-green-50' : ''}`}>
      <TableCell className="sticky left-0 bg-white font-medium py-1 text-xs">
        {row.customer_name}
      </TableCell>
      
      {monthColumns.map((col) => {
        const key = `${col.year}-${col.month}`;
        const monthData = row.months[key] || {
          customer_id: row.customer_id,
          year: col.year,
          month: col.month,
          setup_fee: 0,
          price_per_appointment: 0,
          appointments_delivered: 0,
          recurring_fee: 0
        };
        
        // Check if this specific month has updated fields
        const cellKey = `${row.customer_id}-${col.year}-${col.month}`;
        const cellUpdatedFields = updatedFields[cellKey] || [];
        
        return (
          <RevenueTableCell
            key={key}
            customerId={row.customer_id}
            year={col.year}
            month={col.month}
            monthData={monthData}
            handleCellUpdate={handleCellUpdate}
            updatedFields={cellUpdatedFields}
          />
        );
      })}
      
      <TableCell className="text-right font-bold py-1 text-xs">
        {hasUpdates ? (
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
            }).format(customerTotal)}
          </motion.div>
        ) : (
          new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0 
          }).format(customerTotal)
        )}
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableCustomerRow;
