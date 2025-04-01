
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import RevenueTableCell from './RevenueTableCell';
import { CustomerRevenueRow, MonthColumn } from '@/types/revenue';

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
}

const RevenueTableCustomerRow: React.FC<RevenueTableCustomerRowProps> = ({
  row,
  monthColumns,
  handleCellUpdate
}) => {
  // Calculate customer total across all months
  const customerTotal = monthColumns.reduce((sum, col) => {
    const key = `${col.year}-${col.month}`;
    const monthData = row.months[key];
    if (!monthData) return sum;
    
    return sum + 
      monthData.setup_fee +
      (monthData.price_per_appointment * monthData.appointments_delivered) +
      monthData.recurring_fee;
  }, 0);
  
  return (
    <TableRow key={row.customer_id} className="hover:bg-muted/50 h-auto">
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
        
        return (
          <RevenueTableCell
            key={key}
            customerId={row.customer_id}
            year={col.year}
            month={col.month}
            monthData={monthData}
            handleCellUpdate={handleCellUpdate}
          />
        );
      })}
      
      <TableCell className="text-right font-bold py-1 text-xs">
        {new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        }).format(customerTotal)}
      </TableCell>
    </TableRow>
  );
};

export default RevenueTableCustomerRow;
