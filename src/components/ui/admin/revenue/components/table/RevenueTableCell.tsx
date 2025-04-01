
import React from 'react';
import { TableCell } from '@/components/ui/table';
import EditableRevenueCell from '../../EditableRevenueCell';
import { CustomerRevenue } from '@/types/revenue';

interface RevenueTableCellProps {
  customerId: string;
  year: number;
  month: number;
  monthData: CustomerRevenue;
  handleCellUpdate: (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => void;
}

const RevenueTableCell: React.FC<RevenueTableCellProps> = ({
  customerId,
  year,
  month,
  monthData,
  handleCellUpdate
}) => {
  const totalRevenue = 
    monthData.setup_fee +
    (monthData.price_per_appointment * monthData.appointments_delivered) +
    monthData.recurring_fee;
  
  return (
    <TableCell className="p-0">
      <div className="grid grid-cols-2 divide-x divide-gray-100 h-full">
        <div className="grid grid-rows-2 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-[10px] text-gray-500">Setup:</span>
            <EditableRevenueCell
              value={monthData.setup_fee}
              onChange={(value) => handleCellUpdate(
                customerId, 
                year, 
                month, 
                'setup_fee',
                value
              )}
              format="currency"
              size="xs"
            />
          </div>
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-[10px] text-gray-500">€/Appt:</span>
            <EditableRevenueCell
              value={monthData.price_per_appointment}
              onChange={(value) => handleCellUpdate(
                customerId, 
                year, 
                month, 
                'price_per_appointment',
                value
              )}
              format="currency"
              size="xs"
            />
          </div>
        </div>
        <div className="grid grid-rows-2 divide-y divide-gray-100">
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-[10px] text-gray-500">Appts:</span>
            <EditableRevenueCell
              value={monthData.appointments_delivered}
              onChange={(value) => handleCellUpdate(
                customerId, 
                year, 
                month, 
                'appointments_delivered',
                value
              )}
              size="xs"
            />
          </div>
          <div className="flex items-center justify-between px-1 py-0.5">
            <span className="text-[10px] text-gray-500">Recur:</span>
            <EditableRevenueCell
              value={monthData.recurring_fee}
              onChange={(value) => handleCellUpdate(
                customerId, 
                year, 
                month, 
                'recurring_fee',
                value
              )}
              format="currency"
              size="xs"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-muted/30 px-1 py-0.5 text-right font-bold text-[10px]">
        {new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        }).format(totalRevenue)}
      </div>
    </TableCell>
  );
};

export default RevenueTableCell;
