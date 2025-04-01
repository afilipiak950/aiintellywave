
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { toast } from '@/hooks/use-toast';
import { createSampleCustomer } from '@/services/revenue/init-data-service';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { enableRevenueRealtime } from '@/services/revenue/revenue-sync-service';
import { CustomerRevenue } from '@/types/revenue';

// Import refactored components
import RevenueDashboardHeader from './components/RevenueDashboardHeader';
import RevenueDashboardKpis from './components/RevenueDashboardKpis';
import RevenueDashboardControls from './components/RevenueDashboardControls';
import RevenueTableView from './components/RevenueTableView';
import RevenueChartsView from './components/RevenueChartsView';
import CustomerTableSection from './components/CustomerTableSection';

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
    updatedFields
  } = useRevenueDashboard(12); // Changed to 12 months (full year) default
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  const [showDebug, setShowDebug] = useState(false);
  const [realtimeInitialized, setRealtimeInitialized] = useState(false);
  
  // Function to handle syncing customers to revenue table - use useCallback to prevent recreating this function
  const handleSyncCustomers = useCallback(async () => {
    toast({
      title: 'Synchronisierung gestartet',
      description: 'Kundendaten werden mit der Umsatztabelle synchronisiert...',
    });
    
    await syncCustomers();
  }, [syncCustomers]);

  // Initialize real-time subscriptions once on first render with proper dependency tracking
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

  // Create sample data and then sync it - use useCallback to prevent recreating this function
  const handleCreateAndSyncSampleData = useCallback(async () => {
    try {
      toast({
        title: 'Beispieldaten',
        description: 'Erstelle Beispielkunden...',
      });
      
      await createSampleCustomer();
      
      // Use a timeout to give the database time to process
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
  
  // Fix the type mismatch for updateRevenueCell
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
    
    // Set the appropriate field
    if (field === 'setup_fee') data.setup_fee = value;
    else if (field === 'price_per_appointment') data.price_per_appointment = value;
    else if (field === 'appointments_delivered') data.appointments_delivered = value;
    else if (field === 'recurring_fee') data.recurring_fee = value;
    
    return updateRevenueCell(data);
  }, [updateRevenueCell]);
  
  // Fix the type mismatch for exportCsv
  const handleExportCsv = useCallback(() => {
    exportCsv(currentYear, currentMonth);
  }, [exportCsv, currentYear, currentMonth]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {/* Dashboard Header */}
      <RevenueDashboardHeader 
        title="Umsatz-Dashboard"
        description="Verwalten und verfolgen Sie alle Kundenumsätze, Termine und wiederkehrende Einnahmen."
      />

      {/* Permission error alert */}
      {permissionsError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Error</AlertTitle>
          <AlertDescription>{permissionsError}</AlertDescription>
        </Alert>
      )}

      {/* KPI Cards - pass error if permissions fail */}
      <RevenueDashboardKpis 
        metrics={metrics} 
        loading={loading} 
        error={permissionsError} 
      />

      {/* Controls */}
      <div className="flex justify-between items-center">
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
          syncCustomers={handleSyncCustomers}
          syncStatus={syncStatus}
        />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCreateAndSyncSampleData}
        >
          Beispieldaten erstellen
        </Button>
      </div>

      {/* Table or Charts View */}
      {activeTab === 'table' ? (
        <RevenueTableView
          loading={loading}
          customerRows={customerRows}
          monthColumns={monthColumns}
          monthlyTotals={monthlyTotals}
          handleCellUpdate={handleCellUpdate}
          updatedFields={updatedFields}
          error={permissionsError}
        />
      ) : (
        <RevenueChartsView error={permissionsError} />
      )}
      
      {/* Customer Table Section */}
      <CustomerTableSection onCustomerChange={refreshData} />
      
      {/* Debug info toggle */}
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
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RevenueDashboard;
