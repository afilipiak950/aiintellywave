
import React, { useEffect, useState } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart3, FileDown, AlertCircle, RefreshCw } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import { supabase } from '@/integrations/supabase/client';
import { RevenueMetrics } from '@/types/revenue';

interface ManagerRevenueSectionProps {
  companyId: string;
}

const ManagerRevenueSection = ({ companyId }: ManagerRevenueSectionProps) => {
  const {
    metrics,
    refreshData,
    currentYear,
    currentMonth,
    exportCsv,
    loading,
    permissionsError,
    monthColumns,
    customerRows,
    monthlyTotals
  } = useRevenueDashboard(12);
  
  // State to store customer data
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [calculatedMetrics, setCalculatedMetrics] = useState<RevenueMetrics | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [yearlyDataSynced, setYearlyDataSynced] = useState(false);

  // Initialize with data
  useEffect(() => {
    refreshData();
    fetchCustomerData(); // Also fetch customer data directly
  }, [companyId, refreshData]);
  
  // Function to fetch customer data for metrics calculation
  const fetchCustomerData = async () => {
    try {
      setCustomerLoading(true);
      console.log('Fetching customer data for metrics calculation...');
      
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`Fetched ${data.length} customers for metrics calculation`);
        setCustomerData(data);
        calculateMetricsFromCustomers(data);
        syncCustomersToYearlyData(data); // Add this call to sync customer data to yearly table
      } else {
        console.log('No customer data found');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Calculate metrics from customer data
  const calculateMetricsFromCustomers = (customers: any[]) => {
    if (!customers || customers.length === 0) return;

    console.log('Calculating metrics from customer data:', customers);
    
    const totalAppointments = customers.reduce((sum, customer) => 
      sum + (customer.appointments_per_month || 0), 0);
    
    const totalRevenue = customers.reduce((sum, customer) => {
      const monthlyRevenue = 
        ((customer.price_per_appointment || 0) * (customer.appointments_per_month || 0)) + 
        (customer.monthly_flat_fee || 0);
      return sum + monthlyRevenue;
    }, 0);

    const totalRecurringRevenue = customers.reduce((sum, customer) => 
      sum + (customer.monthly_flat_fee || 0), 0);
    
    const totalSetupRevenue = customers.reduce((sum, customer) => 
      sum + (customer.setup_fee || 0), 0);
    
    const metrics = {
      total_revenue: totalRevenue,
      total_appointments: totalAppointments,
      avg_revenue_per_appointment: 0,
      total_recurring_revenue: totalRecurringRevenue,
      total_setup_revenue: totalSetupRevenue,
      customer_count: customers.length
    };

    // Calculate average revenue per appointment
    if (totalAppointments > 0) {
      metrics.avg_revenue_per_appointment = customers.reduce((sum, customer) => 
        sum + (customer.price_per_appointment || 0), 0) / customers.length;
    }

    console.log('Calculated metrics:', metrics);
    setCalculatedMetrics(metrics);
  };
  
  // New function to sync customer data to yearly revenue data
  const syncCustomersToYearlyData = async (customers: any[]) => {
    if (!customers || customers.length === 0) {
      setYearlyDataSynced(true);
      return;
    }
    
    try {
      console.log('Syncing customers to yearly revenue table...');
      const batch: any[] = [];
      
      customers.forEach(customer => {
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
      });
      
      if (batch.length > 0) {
        // Upsert data in batches to avoid overwhelming the database
        for (let i = 0; i < batch.length; i += 50) {
          const chunk = batch.slice(i, i + 50);
          const { error } = await supabase
            .from('customer_revenue')
            .upsert(chunk, { 
              onConflict: 'customer_id,year,month',
              ignoreDuplicates: false
            });
            
          if (error) {
            console.error('Error syncing customer data to yearly table:', error);
          }
        }
      }
      
      console.log('Customer data synced to yearly revenue table');
      setYearlyDataSynced(true);
      refreshData(); // Refresh data to show the newly synced entries
    } catch (error) {
      console.error('Error in syncCustomersToYearlyData:', error);
    }
  };
  
  // Create a safe version of exportCsv to handle type mismatch
  const handleExport = () => {
    if (typeof exportCsv === 'function') {
      exportCsv(currentYear, currentMonth);
    }
  };

  // Listen to changes in the customers table
  useEffect(() => {
    const customerChanges = supabase
      .channel('customer-table-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customer table changed, refreshing data:', payload);
          fetchCustomerData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(customerChanges);
    };
  }, []);

  // Manually trigger sync when needed
  const handleSyncData = () => {
    fetchCustomerData();
  };

  // Show error if permissions issue
  if (permissionsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Error</AlertTitle>
        <AlertDescription>{permissionsError}</AlertDescription>
      </Alert>
    );
  }

  // Determine which metrics to display - prefer calculated from customers if available
  const displayMetrics = calculatedMetrics || metrics;
  const isLoading = loading || customerLoading;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncData}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refreshData()}
            disabled={isLoading}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Details
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(displayMetrics?.total_revenue || 0)} 
          trend={{ value: '2.5', positive: true }}
          loading={isLoading}
        />
        <StatCard 
          title="Monthly Appointments" 
          value={displayMetrics?.total_appointments?.toString() || '0'} 
          trend={{ value: '1.2', positive: true }}
          loading={isLoading}
        />
        <StatCard 
          title="Recurring Revenue" 
          value={new Intl.NumberFormat('de-DE', { 
            style: 'currency', 
            currency: 'EUR' 
          }).format(displayMetrics?.total_recurring_revenue || 0)} 
          trend={{ value: '3.7', positive: true }}
          loading={isLoading}
        />
      </div>
      
      {/* Show message when no data but not loading */}
      {!isLoading && displayMetrics && Object.values(displayMetrics).every(v => v === 0) && (
        <Alert variant="default" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            No revenue data found for this period.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Show sync status */}
      {!yearlyDataSynced && customerData.length > 0 && !isLoading && (
        <Alert variant="default" className="mt-4 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Syncing Data</AlertTitle>
          <AlertDescription>
            Customer data is being synced to the yearly revenue table. This may take a moment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ManagerRevenueSection;
