
import React, { useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { CustomerRevenue } from '@/types/revenue';
import { motion } from 'framer-motion';
import EditableRevenueCell from '../../EditableRevenueCell';

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
  updatedFields?: string[];
}

const RevenueTableCell: React.FC<RevenueTableCellProps> = ({
  customerId,
  year,
  month,
  monthData,
  handleCellUpdate,
  updatedFields = []
}) => {
  // Calculate total revenue for this cell
  const totalRevenue = (
    (monthData.setup_fee || 0) +
    ((monthData.price_per_appointment || 0) * (monthData.appointments_delivered || 0)) +
    (monthData.recurring_fee || 0)
  );
  
  const handleSetupFeeUpdate = (value: number) => {
    handleCellUpdate(customerId, year, month, 'setup_fee', value);
  };
  
  const handlePricePerAppointmentUpdate = (value: number) => {
    handleCellUpdate(customerId, year, month, 'price_per_appointment', value);
  };
  
  const handleAppointmentsUpdate = (value: number) => {
    handleCellUpdate(customerId, year, month, 'appointments_delivered', value);
  };
  
  const handleRecurringFeeUpdate = (value: number) => {
    handleCellUpdate(customerId, year, month, 'recurring_fee', value);
  };
  
  return (
    <TableCell className="text-right py-1 text-xs px-1">
      <div className="flex flex-col space-y-1 w-full">
        {/* Setup Fee */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Setup:</span>
          <EditableRevenueCell
            value={monthData.setup_fee || 0}
            format="currency"
            onChange={handleSetupFeeUpdate}
            isHighlighted={updatedFields.includes('setup_fee')}
            size="xs"
          />
        </div>
        
        {/* Price per Appointment */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Preis/Termin:</span>
          <EditableRevenueCell
            value={monthData.price_per_appointment || 0}
            format="currency"
            onChange={handlePricePerAppointmentUpdate}
            isHighlighted={updatedFields.includes('price_per_appointment')}
            size="xs"
          />
        </div>
        
        {/* Appointments */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Termine:</span>
          <EditableRevenueCell
            value={monthData.appointments_delivered || 0}
            onChange={handleAppointmentsUpdate}
            isHighlighted={updatedFields.includes('appointments_delivered')}
            size="xs"
          />
        </div>
        
        {/* Recurring Fee */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Monatlich:</span>
          <EditableRevenueCell
            value={monthData.recurring_fee || 0}
            format="currency"
            onChange={handleRecurringFeeUpdate}
            isHighlighted={updatedFields.includes('recurring_fee')}
            size="xs"
          />
        </div>
        
        {/* Total */}
        <div className="font-bold border-t border-gray-200 pt-0.5">
          {updatedFields.includes('total_revenue') ? (
            <motion.div
              initial={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
              animate={{ backgroundColor: "rgba(34, 197, 94, 0)" }}
              transition={{ duration: 2 }}
              className="px-1 py-0.5 rounded"
            >
              {new Intl.NumberFormat('de-DE', { 
                style: 'currency', 
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              }).format(totalRevenue)}
            </motion.div>
          ) : (
            new Intl.NumberFormat('de-DE', { 
              style: 'currency', 
              currency: 'EUR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(totalRevenue)
          )}
        </div>
      </div>
    </TableCell>
  );
};

export default RevenueTableCell;
