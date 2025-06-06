import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { toast } from '@/hooks/use-toast';
import { createSampleCustomer } from '@/services/revenue/init-data-service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { enableRevenueRealtime } from '@/services/revenue/revenue-sync-service';
import { CustomerRevenue, RevenueMetrics } from '@/types/revenue';

import RevenueDashboardHeader from './components/RevenueDashboardHeader';
import RevenueDashboardKpis from './components/RevenueDashboardKpis';
import RevenueDashboardControls from './components/RevenueDashboardControls';
import RevenueChartsView from './components/RevenueChartsView';
import CustomerTableSection from './components/CustomerTableSection';
import RevenueTableView from './components/RevenueTableView';
import StandardExcelView from './components/StandardExcelView';

const RevenueDashboard = () => {
  const {
    loading,
    metrics,
    permissions,
    permissionsError,
    monthColumns,
    customerRows,
    monthlyTotals,
    navigateMonths,
    updateRevenueCell,
    monthsToShow,
    changeMonthsToShow,
    currentMonth,
    currentYear,
    exportCsv,
    changeYearFilter,
    yearFilter,
    refreshData,
    syncCustomers,
    syncStatus,
    updatedFields,
    setCalculatedMetrics: updateDashboardMetrics
  } = useRevenueDashboard(12);

  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'excel'>('excel');
  const [showDebug, setShowDebug] = useState(false);
  const [realtimeInitialized, setRealtimeInitialized] = useState(false);
  const [customersTableData, setCustomersTableData] = useState<any[]>([]);
  const [calculatedMetrics, setLocalCalculatedMetrics] = useState<RevenueMetrics | null>(null);

  const handleSyncCustomers = useCallback(async () => {
    toast({
      title: 'Synchronisierung gestartet',
      description: 'Kundendaten werden mit der Umsatztabelle synchronisiert...',
    });
    
    await syncCustomers();
  }, [syncCustomers]);

  useEffect(() => {
    if (!realtimeInitialized) {
      const initRealtime = async () => {
        try {
          console.log('Initializing real-time subscriptions...');
          const result = await enableRevenueRealtime();
          if (result) {
            console.log('Realtime subscriptions initialized successfully');
            setRealtimeInitialized(true);
          } else {
            console.error('Failed to initialize realtime subscriptions');
          }
        } catch (error) {
          console.error('Error initializing realtime:', error);
        }
      };
      
      initRealtime();
    }
  }, [realtimeInitialized]);

  const handleCreateAndSyncSampleData = useCallback(async () => {
    try {
      toast({
        title: 'Beispieldaten',
        description: 'Erstelle Beispielkunden...',
      });
      
      await createSampleCustomer();
      
      setTimeout(() => {
        refreshData();
        handleSyncCustomers();
      }, 500);
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Erstellen der Beispieldaten',
        variant: 'destructive'
      });
    }
  }, [refreshData, handleSyncCustomers]);

  const handleCellUpdate = useCallback((
    customerId: string,
    year: number,
    month: number,
    field: string,
    value: number
  ) => {
    const data: CustomerRevenue = {
      customer_id: customerId,
      year,
      month,
      setup_fee: 0,
      price_per_appointment: 0,
      appointments_delivered: 0,
      recurring_fee: 0
    };
    
    if (field === 'setup_fee') data.setup_fee = value;
    else if (field === 'price_per_appointment') data.price_per_appointment = value;
    else if (field === 'appointments_delivered') data.appointments_delivered = value;
    else if (field === 'recurring_fee') data.recurring_fee = value;
    
    return updateRevenueCell(data);
  }, [updateRevenueCell]);

  const handleExportCsv = useCallback(() => {
    exportCsv(currentYear, currentMonth);
  }, [exportCsv, currentYear, currentMonth]);

  const calculateMetricsFromCustomerData = useCallback((customers: any[]) => {
    if (!customers || customers.length === 0) return null;
    
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
    
    const avgRevenuePerAppointment = totalAppointments > 0 ? 
      customers.reduce((sum, customer) => 
        sum + (customer.price_per_appointment || 0), 0) / customers.length : 0;

    return {
      total_revenue: totalRevenue,
      total_appointments: totalAppointments,
      avg_revenue_per_appointment: avgRevenuePerAppointment,
      total_recurring_revenue: totalRecurringRevenue,
      total_setup_revenue: totalSetupRevenue,
      customer_count: customers.length
    };
  }, []);

  const handleCustomerDataChange = useCallback((customerData: any[]) => {
    console.log('Received updated customer data:', customerData);
    setCustomersTableData(customerData);
    
    const newMetrics = calculateMetricsFromCustomerData(customerData);
    if (newMetrics) {
      console.log('Calculated new metrics from customer data:', newMetrics);
      setLocalCalculatedMetrics(newMetrics);
      updateDashboardMetrics(newMetrics);
    }
  }, [calculateMetricsFromCustomerData, updateDashboardMetrics]);

  const displayMetrics = calculatedMetrics || metrics;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <RevenueDashboardHeader 
        title="Umsatz-Dashboard"
        description="Verwalten und verfolgen Sie alle Kundenumsätze, Termine und wiederkehrende Einnahmen."
      />

      {permissionsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>{permissionsError}</AlertDescription>
        </Alert>
      )}

      <RevenueDashboardKpis 
        metrics={displayMetrics} 
        loading={loading} 
        error={permissionsError} 
      />

      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button 
            variant={activeTab === 'excel' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('excel')}
          >
            Excel-Tabelle
          </Button>
          <Button 
            variant={activeTab === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('table')}
          >
            Umsatz-Tabelle
          </Button>
          <Button 
            variant={activeTab === 'charts' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('charts')}
          >
            Diagramme
          </Button>
        </div>
        
        {activeTab === 'table' && (
          <RevenueDashboardControls
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentMonth={currentMonth}
            currentYear={currentYear}
            monthsToShow={monthsToShow}
            navigateMonths={navigateMonths}
            changeMonthsToShow={changeMonthsToShow}
            exportCsv={handleExportCsv}
            changeYearFilter={changeYearFilter}
            yearFilter={yearFilter}
            refreshData={refreshData}
            syncCustomers={syncCustomers}
            syncStatus={syncStatus}
          />
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCreateAndSyncSampleData}
        >
          Beispieldaten erstellen
        </Button>
      </div>

      {activeTab === 'table' && (
        <RevenueTableView
          loading={loading}
          customerRows={customerRows}
          monthColumns={monthColumns}
          monthlyTotals={monthlyTotals}
          handleCellUpdate={handleCellUpdate}
          onCreateSampleData={handleCreateAndSyncSampleData}
          updatedFields={updatedFields}
          error={permissionsError}
        />
      )}
      {activeTab === 'charts' && (
        <RevenueChartsView error={permissionsError} />
      )}
      {activeTab === 'excel' && (
        <StandardExcelView error={permissionsError} />
      )}
      
      <CustomerTableSection 
        onCustomerChange={refreshData} 
        onCustomerDataUpdate={handleCustomerDataChange}
      />
      
      <div className="mt-8 border-t pt-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Debug-Info ausblenden' : 'Debug-Info anzeigen'}
        </Button>
        
        {showDebug && (
          <div className="mt-2 p-4 bg-slate-50 rounded-md text-xs overflow-auto max-h-64">
            <h3 className="font-semibold">Umsatzdaten:</h3>
            <pre>{JSON.stringify(customerRows, null, 2)}</pre>
            <h3 className="font-semibold mt-2">Kennzahlen:</h3>
            <pre>{JSON.stringify(metrics, null, 2)}</pre>
            <h3 className="font-semibold mt-2">Aktualisierte Felder:</h3>
            <pre>{JSON.stringify(updatedFields, null, 2)}</pre>
            <h3 className="font-semibold mt-2">Status:</h3>
            <pre>Realtime initialized: {realtimeInitialized ? 'Yes' : 'No'}</pre>
            <pre>Sync status: {syncStatus}</pre>
            <pre>Current month/year: {currentMonth}/{currentYear}</pre>
            <pre>Permissions: {JSON.stringify(permissions, null, 2)}</pre>
            <pre>Active Tab: {activeTab}</pre>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RevenueDashboard;
