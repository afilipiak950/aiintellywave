
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import EditableRevenueCell from '../EditableRevenueCell';
import { CustomerRevenue, CustomerRevenueRow, MonthColumn } from '@/types/revenue';

interface RevenueTableViewProps {
  loading: boolean;
  customerRows: CustomerRevenueRow[];
  monthColumns: MonthColumn[];
  monthlyTotals: Record<string, {
    setup_fee: number;
    appointments: number;
    recurring_fee: number;
    total_revenue: number;
  }>;
  handleCellUpdate: (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => void;
}

const RevenueTableView = ({
  loading,
  customerRows,
  monthColumns,
  monthlyTotals,
  handleCellUpdate
}: RevenueTableViewProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="border-collapse whitespace-nowrap">
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[150px] min-w-[150px] sticky left-0 bg-muted/50 z-10">Customer</TableHead>
                
                {monthColumns.map((col) => (
                  <TableHead key={`${col.year}-${col.month}`} className="text-center min-w-[200px]">
                    {col.label}
                  </TableHead>
                ))}
                
                <TableHead className="text-center font-bold min-w-[100px]">Total</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="sticky left-0 bg-white">
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    
                    {monthColumns.map((col) => (
                      <TableCell key={`loading-${idx}-${col.year}-${col.month}`}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                    
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : customerRows.length > 0 ? (
                // Customer rows
                customerRows.map((row) => (
                  <TableRow key={row.customer_id} className="hover:bg-muted/50">
                    <TableCell className="sticky left-0 bg-white font-medium">
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
                      
                      const totalRevenue = 
                        monthData.setup_fee +
                        (monthData.price_per_appointment * monthData.appointments_delivered) +
                        monthData.recurring_fee;
                      
                      return (
                        <TableCell key={key} className="p-0">
                          <div className="grid grid-cols-2 divide-x divide-gray-100 h-full">
                            <div className="grid grid-rows-2 divide-y divide-gray-100">
                              <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs text-gray-500">Setup:</span>
                                <EditableRevenueCell
                                  value={monthData.setup_fee}
                                  onChange={(value) => handleCellUpdate(
                                    row.customer_id, 
                                    col.year, 
                                    col.month, 
                                    'setup_fee',
                                    value
                                  )}
                                  format="currency"
                                />
                              </div>
                              <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs text-gray-500">€/Appt:</span>
                                <EditableRevenueCell
                                  value={monthData.price_per_appointment}
                                  onChange={(value) => handleCellUpdate(
                                    row.customer_id, 
                                    col.year, 
                                    col.month, 
                                    'price_per_appointment',
                                    value
                                  )}
                                  format="currency"
                                />
                              </div>
                            </div>
                            <div className="grid grid-rows-2 divide-y divide-gray-100">
                              <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs text-gray-500">Appts:</span>
                                <EditableRevenueCell
                                  value={monthData.appointments_delivered}
                                  onChange={(value) => handleCellUpdate(
                                    row.customer_id, 
                                    col.year, 
                                    col.month, 
                                    'appointments_delivered',
                                    value
                                  )}
                                />
                              </div>
                              <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs text-gray-500">Recurring:</span>
                                <EditableRevenueCell
                                  value={monthData.recurring_fee}
                                  onChange={(value) => handleCellUpdate(
                                    row.customer_id, 
                                    col.year, 
                                    col.month, 
                                    'recurring_fee',
                                    value
                                  )}
                                  format="currency"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="border-t border-gray-100 bg-muted/30 px-2 py-1 text-right font-bold text-sm">
                            {new Intl.NumberFormat('de-DE', { 
                              style: 'currency', 
                              currency: 'EUR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0 
                            }).format(totalRevenue)}
                          </div>
                        </TableCell>
                      );
                    })}
                    
                    <TableCell className="text-right font-bold">
                      {/* Customer total across all months */}
                      {new Intl.NumberFormat('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(
                        monthColumns.reduce((sum, col) => {
                          const key = `${col.year}-${col.month}`;
                          const monthData = row.months[key];
                          if (!monthData) return sum;
                          
                          return sum + 
                            monthData.setup_fee +
                            (monthData.price_per_appointment * monthData.appointments_delivered) +
                            monthData.recurring_fee;
                        }, 0)
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={monthColumns.length + 2} className="h-32 text-center">
                    No revenue data found. Start by adding data for your customers.
                  </TableCell>
                </TableRow>
              )}

              {/* Totals row */}
              {!loading && customerRows.length > 0 && (
                <TableRow className="bg-muted font-bold border-t-2 border-border">
                  <TableCell className="sticky left-0 bg-muted">TOTAL</TableCell>
                  
                  {monthColumns.map((col) => {
                    const key = `${col.year}-${col.month}`;
                    const monthTotal = monthlyTotals[key] || {
                      setup_fee: 0,
                      appointments: 0, 
                      recurring_fee: 0,
                      total_revenue: 0
                    };
                    
                    return (
                      <TableCell key={`total-${key}`} className="text-right">
                        {new Intl.NumberFormat('de-DE', { 
                          style: 'currency', 
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0 
                        }).format(monthTotal.total_revenue)}
                      </TableCell>
                    );
                  })}
                  
                  <TableCell className="text-right">
                    {/* Grand total */}
                    {new Intl.NumberFormat('de-DE', { 
                      style: 'currency', 
                      currency: 'EUR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }).format(
                      Object.values(monthlyTotals).reduce(
                        (sum, month) => sum + month.total_revenue, 
                        0
                      )
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTableView;
