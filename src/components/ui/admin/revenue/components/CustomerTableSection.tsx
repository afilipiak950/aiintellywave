
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import CustomerCreationForm from '@/components/ui/customer/CustomerCreationForm'; // Updated import path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertCircle, PlusCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CustomerTableSectionProps {
  onCustomerChange?: () => void;
  onCustomerDataUpdate?: (data: any[]) => void;
}

const CustomerTableSection: React.FC<CustomerTableSectionProps> = ({ 
  onCustomerChange,
  onCustomerDataUpdate
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Function to format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '€0';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Load customers
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setCustomers(data || []);
      
      // If there's a callback for updating data, call it
      if (onCustomerDataUpdate && data) {
        onCustomerDataUpdate(data);
      }
      
    } catch (error: any) {
      console.error('Error loading customers:', error);
      setError(error.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [onCustomerDataUpdate]);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('customer-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customer table changed:', payload);
          loadCustomers();
          if (onCustomerChange) {
            onCustomerChange();
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadCustomers, onCustomerChange]);

  // Handle form submission
  const handleFormSubmit = async (customer: any) => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      
      if (editingCustomer) {
        // Update existing customer
        const { data, error } = await supabase
          .from('customers')
          .update(customer)
          .eq('id', editingCustomer.id)
          .select();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert(customer)
          .select();
          
        if (error) throw error;
        result = data;
      }
      
      setShowForm(false);
      setEditingCustomer(null);
      
      // Now automatically sync with revenue table
      if (result && result.length > 0) {
        await syncCustomerToRevenue(result[0]);
      }
      
      loadCustomers();
      
    } catch (error: any) {
      console.error('Error saving customer:', error);
      setError(error.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  // Function to sync a customer to the revenue table
  const syncCustomerToRevenue = async (customer: any) => {
    try {
      console.log('Syncing customer to revenue table:', customer);
      
      const currentYear = new Date().getFullYear();
      const batch = [];
      
      // Create entries for each month of the current year
      for (let month = 1; month <= 12; month++) {
        batch.push({
          customer_id: customer.id,
          year: currentYear,
          month: month,
          setup_fee: month === 1 ? (customer.setup_fee || 0) : 0, // Only add setup fee in the first month
          price_per_appointment: customer.price_per_appointment || 0,
          appointments_delivered: customer.appointments_per_month || 0,
          recurring_fee: customer.monthly_flat_fee || 0
        });
      }
      
      const { error } = await supabase
        .from('customer_revenue')
        .upsert(batch, { 
          onConflict: 'customer_id,year,month',
          ignoreDuplicates: false
        });
        
      if (error) {
        console.error('Error syncing customer to revenue:', error);
      } else {
        console.log('Customer synced to revenue table successfully');
        if (onCustomerChange) {
          onCustomerChange(); // Notify parent component of the change
        }
      }
      
    } catch (error) {
      console.error('Error in syncCustomerToRevenue:', error);
    }
  };

  // Handle editing a customer
  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  // Handle sync all customers to revenue
  const syncAllCustomers = async () => {
    try {
      setLoading(true);
      for (const customer of customers) {
        await syncCustomerToRevenue(customer);
      }
    } catch (error) {
      console.error('Error syncing all customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Customers</CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setEditingCustomer(null);
              setShowForm(true);
            }}
            size="sm"
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Customer
          </Button>
          <Button 
            onClick={syncAllCustomers}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Sync All to Revenue
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showForm && (
          <div className="mb-4">
            <CustomerCreationForm 
              initialData={editingCustomer}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        )}
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Setup Fee</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Price/Appointment</TableHead>
                <TableHead>Appointments/Month</TableHead>
                <TableHead>Monthly Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => {
                  const monthlyRevenue = 
                    (customer.price_per_appointment * customer.appointments_per_month) +
                    customer.monthly_flat_fee;
                    
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{formatCurrency(customer.setup_fee)}</TableCell>
                      <TableCell>{formatCurrency(customer.monthly_flat_fee)}</TableCell>
                      <TableCell>{formatCurrency(customer.price_per_appointment)}</TableCell>
                      <TableCell>{customer.appointments_per_month}</TableCell>
                      <TableCell>
                        {formatCurrency(monthlyRevenue)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerTableSection;
