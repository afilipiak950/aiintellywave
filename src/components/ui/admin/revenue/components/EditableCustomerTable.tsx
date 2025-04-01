
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import EditableRevenueCell from '../EditableRevenueCell';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface EditableCustomerTableProps {
  onDataChange?: () => void;
}

interface CustomerTableData {
  id: string;
  name: string;
  setup_fee: number;
  monthly_flat_fee: number;
  price_per_appointment: number;
  appointments_per_month: number;
  monthly_revenue: number;
  start_date: string | null;
  end_date: string | null;
}

const EditableCustomerTable: React.FC<EditableCustomerTableProps> = ({ onDataChange }) => {
  const [customers, setCustomers] = useState<CustomerTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedCells, setUpdatedCells] = useState<Record<string, string[]>>({});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Calculate monthly revenue for each customer
      const customersWithRevenue = (data || []).map(customer => {
        const monthlyRevenue = 
          (customer.price_per_appointment * customer.appointments_per_month) +
          customer.monthly_flat_fee;
          
        return {
          ...customer,
          monthly_revenue: monthlyRevenue
        };
      });
      
      setCustomers(customersWithRevenue);
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadCustomers();
    
    // Set up real-time subscription for customer table changes
    const subscription = supabase
      .channel('customer-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          loadCustomers();
          if (onDataChange) onDataChange();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [onDataChange]);
  
  // Update a customer field
  const handleCellUpdate = async (customerId: string, field: string, value: number) => {
    try {
      // First update local state for immediate feedback
      setCustomers(prev => prev.map(customer => {
        if (customer.id === customerId) {
          const updatedCustomer = { ...customer, [field]: value };
          
          // Recalculate monthly revenue if needed
          if (['price_per_appointment', 'appointments_per_month', 'monthly_flat_fee'].includes(field)) {
            updatedCustomer.monthly_revenue = 
              (updatedCustomer.price_per_appointment * updatedCustomer.appointments_per_month) +
              updatedCustomer.monthly_flat_fee;
          }
          
          return updatedCustomer;
        }
        return customer;
      }));
      
      // Highlight the updated cell
      setUpdatedCells(prev => ({
        ...prev,
        [customerId]: [...(prev[customerId] || []), field]
      }));
      
      // Clear highlight after 2 seconds
      setTimeout(() => {
        setUpdatedCells(prev => {
          const updated = { ...prev };
          if (updated[customerId]) {
            updated[customerId] = updated[customerId].filter(f => f !== field);
            if (updated[customerId].length === 0) delete updated[customerId];
          }
          return updated;
        });
      }, 2000);
      
      // Update in database
      const { error } = await supabase
        .from('customers')
        .update({ [field]: value })
        .eq('id', customerId);
        
      if (error) throw error;
      
      // Also update any future revenue entries
      if (['price_per_appointment', 'appointments_per_month', 'monthly_flat_fee', 'setup_fee'].includes(field)) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        // Get current and future revenue entries
        const { data: revenueEntries, error: fetchError } = await supabase
          .from('customer_revenue')
          .select('id')
          .eq('customer_id', customerId)
          .or(`year.gt.${currentYear},and(year.eq.${currentYear},month.gte.${currentMonth})`);
          
        if (fetchError) throw fetchError;
        
        // Update the field in all future entries
        if (revenueEntries && revenueEntries.length > 0) {
          const entryIds = revenueEntries.map(entry => entry.id);
          
          // Map revenue field names to customer field names
          const fieldMapping: Record<string, string> = {
            'setup_fee': 'setup_fee',
            'price_per_appointment': 'price_per_appointment',
            'appointments_per_month': 'appointments_delivered',
            'monthly_flat_fee': 'recurring_fee'
          };
          
          if (fieldMapping[field]) {
            const { error: updateError } = await supabase
              .from('customer_revenue')
              .update({ [fieldMapping[field]]: value })
              .in('id', entryIds);
              
            if (updateError) {
              console.error('Error updating revenue entries:', updateError);
            }
          }
        }
      }
      
    } catch (err: any) {
      console.error('Error updating cell:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update data',
        variant: 'destructive'
      });
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border rounded-lg">
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-500px)] min-h-[300px]">
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="font-bold">Customer</TableHead>
                  <TableHead className="font-bold text-right">Setup Fee</TableHead>
                  <TableHead className="font-bold text-right">Monthly Fee</TableHead>
                  <TableHead className="font-bold text-right">Price/Appointment</TableHead>
                  <TableHead className="font-bold text-center">Appointments/Month</TableHead>
                  <TableHead className="font-bold text-right">Monthly Revenue</TableHead>
                  <TableHead className="font-bold">Start Date</TableHead>
                  <TableHead className="font-bold">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading customer data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No customer data available
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-semibold">{customer.name}</TableCell>
                      
                      <TableCell>
                        <EditableRevenueCell
                          value={customer.setup_fee}
                          format="currency"
                          onChange={(value) => handleCellUpdate(customer.id, 'setup_fee', value)}
                          isHighlighted={updatedCells[customer.id]?.includes('setup_fee')}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <EditableRevenueCell
                          value={customer.monthly_flat_fee}
                          format="currency"
                          onChange={(value) => handleCellUpdate(customer.id, 'monthly_flat_fee', value)}
                          isHighlighted={updatedCells[customer.id]?.includes('monthly_flat_fee')}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <EditableRevenueCell
                          value={customer.price_per_appointment}
                          format="currency"
                          onChange={(value) => handleCellUpdate(customer.id, 'price_per_appointment', value)}
                          isHighlighted={updatedCells[customer.id]?.includes('price_per_appointment')}
                        />
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <EditableRevenueCell
                          value={customer.appointments_per_month}
                          onChange={(value) => handleCellUpdate(customer.id, 'appointments_per_month', value)}
                          isHighlighted={updatedCells[customer.id]?.includes('appointments_per_month')}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-right font-semibold">
                          {formatCurrency(customer.monthly_revenue)}
                        </div>
                      </TableCell>
                      
                      <TableCell>{customer.start_date || '-'}</TableCell>
                      <TableCell>{customer.end_date || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EditableCustomerTable;
