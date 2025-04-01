
import React, { useState } from 'react';
import { TableCell } from '@/components/ui/table';
import { CustomerRevenue } from '@/types/revenue';
import { motion } from 'framer-motion';

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
  
  // Helper function to render a value with animation if needed
  const renderAnimatedValue = (value: number, fieldName: string) => {
    const isUpdated = updatedFields.includes(fieldName);
    
    if (isUpdated) {
      return (
        <motion.div
          initial={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
          animate={{ backgroundColor: "rgba(34, 197, 94, 0)" }}
          transition={{ duration: 2 }}
          className="px-1 py-0.5 rounded"
        >
          {value}
        </motion.div>
      );
    }
    
    return value;
  };
  
  return (
    <TableCell key={`${customerId}-${year}-${month}`} className="text-right py-1 text-xs">
      <div className="flex flex-col space-y-1">
        {/* Setup Fee */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Setup:</span>
          <span>
            {renderAnimatedValue(
              monthData.setup_fee || 0, 
              'setup_fee'
            )}
          </span>
        </div>
        
        {/* Price per Appointment */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Preis/Termin:</span>
          <span>
            {renderAnimatedValue(
              monthData.price_per_appointment || 0,
              'price_per_appointment'
            )}
          </span>
        </div>
        
        {/* Appointments */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Termine:</span>
          <span>
            {renderAnimatedValue(
              monthData.appointments_delivered || 0,
              'appointments_delivered'
            )}
          </span>
        </div>
        
        {/* Recurring Fee */}
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Monatlich:</span>
          <span>
            {renderAnimatedValue(
              monthData.recurring_fee || 0,
              'recurring_fee'
            )}
          </span>
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
