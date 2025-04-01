
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  Filter,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import KpiCardRevenue from './KpiCardRevenue';
import EditableRevenueCell from './EditableRevenueCell';
import { useRevenueDashboard } from '@/hooks/use-revenue-dashboard';
import { CustomerRevenue } from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';

const RevenueDashboard = () => {
  const {
    loading,
    metrics,
    monthColumns,
    customerRows,
    monthlyTotals,
    navigateMonths,
    updateRevenueCell,
    monthsToShow,
    changeMonthsToShow,
    currentMonth,
    currentYear
  } = useRevenueDashboard(6);
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  
  const handleCellUpdate = (
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => {
    const monthKey = `${year}-${month}`;
    const customerRow = customerRows.find(row => row.customer_id === customerId);
    
    if (!customerRow) return;
    
    const existingData = customerRow.months[monthKey] || {
      customer_id: customerId,
      year,
      month,
      setup_fee: 0,
      price_per_appointment: 0,
      appointments_delivered: 0,
      recurring_fee: 0
    };
    
    const updatedData = {
      ...existingData,
      [field]: value
    };
    
    updateRevenueCell(updatedData);
  };
  
  // Export data as CSV
  const exportCsv = () => {
    // Convert data to CSV format
    const headers = ['Customer', ...monthColumns.map(col => col.label), 'Total'];
    const rows = customerRows.map(row => {
      const customerName = row.customer_name;
      const monthData = monthColumns.map(col => {
        const key = `${col.year}-${col.month}`;
        const monthRevenue = row.months[key]?.total_revenue || 0;
        return monthRevenue.toFixed(2);
      });
      
      // Calculate total for this customer
      const total = monthColumns.reduce((sum, col) => {
        const key = `${col.year}-${col.month}`;
        return sum + (row.months[key]?.total_revenue || 0);
      }, 0);
      
      return [customerName, ...monthData, total.toFixed(2)];
    });
    
    // Add totals row
    const totalRow = ['TOTAL'];
    monthColumns.forEach(col => {
      const key = `${col.year}-${col.month}`;
      totalRow.push((monthlyTotals[key]?.total_revenue || 0).toFixed(2));
    });
    
    // Calculate grand total
    const grandTotal = Object.values(monthlyTotals).reduce(
      (sum, month) => sum + month.total_revenue, 
      0
    );
    totalRow.push(grandTotal.toFixed(2));
    
    rows.push(totalRow);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_report_${currentYear}_${currentMonth}.csv`;
    link.click();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Revenue Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and track all customer revenue, appointments, and recurring income.
        </p>
      </div>

      {/* KPI Cards - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCardRevenue 
          title="Total Revenue"
          value={metrics?.total_revenue || 0}
          icon="money"
          variant="primary"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Appointments" 
          value={metrics?.total_appointments || 0}
          icon="calendar"
          variant="warning"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Revenue per Appointment" 
          value={metrics?.avg_revenue_per_appointment || 0}
          icon="trend"
          variant="success"
          format="currency"
          isLoading={loading}
        />
      </div>

      {/* KPI Cards - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCardRevenue 
          title="Recurring Revenue" 
          value={metrics?.total_recurring_revenue || 0}
          icon="money"
          variant="info"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Setup Revenue" 
          value={metrics?.total_setup_revenue || 0}
          icon="money"
          variant="default"
          format="currency"
          isLoading={loading}
        />
        <KpiCardRevenue 
          title="Active Customers" 
          value={metrics?.customer_count || 0}
          icon="users"
          variant="success"
          isLoading={loading}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('table')}
            className={activeTab === 'table' ? 'bg-primary text-primary-foreground' : ''}
          >
            <Calendar className="h-4 w-4 mr-1" /> Table View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('charts')}
            className={activeTab === 'charts' ? 'bg-primary text-primary-foreground' : ''}
          >
            <PieChart className="h-4 w-4 mr-1" /> Charts
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => navigateMonths('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {new Date(currentYear, currentMonth - 1).toLocaleDateString('de-DE', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </span>
          
          <Button size="sm" variant="outline" onClick={() => navigateMonths('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={monthsToShow.toString()}
            onValueChange={(value) => changeMonthsToShow(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button size="sm" variant="outline" onClick={() => {}}>
            <Filter className="h-4 w-4 mr-1" /> Filter
          </Button>
          
          <Button size="sm" variant="default" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Table View */}
      {activeTab === 'table' && (
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
      )}

      {/* Charts View - Placeholder for now */}
      {activeTab === 'charts' && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Revenue Charts</h3>
          <p className="text-muted-foreground">
            This feature is coming soon. It will show revenue trends, customer comparison, and more visual analytics.
          </p>
        </Card>
      )}
    </motion.div>
  );
};

export default RevenueDashboard;
