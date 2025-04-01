
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { toast } from '@/hooks/use-toast';
import { createSampleCustomer } from '@/services/revenue/init-data-service';
import { Button } from '@/components/ui/button';
import { enableRevenueRealtime } from '@/services/revenue/revenue-sync-service';

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
  
  // Function to handle syncing customers to revenue table
  const handleSyncCustomers = async () => {
    toast({
      title: 'Synchronisierung gestartet',
      description: 'Kundendaten werden mit der Umsatztabelle synchronisiert...',
    });
    
    await syncCustomers();
    
    // Refresh the data after syncing
    refreshData();
  };

  // Effect for handling sync status changes
  useEffect(() => {
    if (syncStatus === 'error') {
      console.error('Sync failed');
    } else if (syncStatus === 'success') {
      console.log('Sync successful');
    }
  }, [syncStatus]);

  // Initialize real-time subscriptions on first render
  useEffect(() => {
    enableRevenueRealtime();
  }, []);

  // Create sample data and then sync it
  const handleCreateAndSyncSampleData = async () => {
    await createSampleCustomer();
    refreshData();
    handleSyncCustomers();
  };
  
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

      {/* KPI Cards */}
      <RevenueDashboardKpis metrics={metrics} loading={loading} />

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
          exportCsv={exportCsv}
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
          handleCellUpdate={updateRevenueCell}
          updatedFields={updatedFields}
        />
      ) : (
        <RevenueChartsView />
      )}
      
      {/* Customer Table Section */}
      <CustomerTableSection />
      
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
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RevenueDashboard;
