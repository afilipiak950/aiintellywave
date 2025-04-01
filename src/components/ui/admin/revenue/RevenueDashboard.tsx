
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';
import { toast } from '@/hooks/use-toast';

// Import refactored components
import RevenueDashboardHeader from './components/RevenueDashboardHeader';
import RevenueDashboardKpis from './components/RevenueDashboardKpis';
import RevenueDashboardControls from './components/RevenueDashboardControls';
import RevenueTableView from './components/RevenueTableView';
import RevenueChartsView from './components/RevenueChartsView';

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
    syncStatus
  } = useRevenueDashboard(12); // Changed to 12 months (full year) default
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  
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
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      {/* Dashboard Header */}
      <RevenueDashboardHeader 
        title="Revenue Dashboard"
        description="Manage and track all customer revenue, appointments, and recurring income."
      />

      {/* KPI Cards */}
      <RevenueDashboardKpis metrics={metrics} loading={loading} />

      {/* Controls */}
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

      {/* Table or Charts View */}
      {activeTab === 'table' ? (
        <RevenueTableView
          loading={loading}
          customerRows={customerRows}
          monthColumns={monthColumns}
          monthlyTotals={monthlyTotals}
          handleCellUpdate={updateRevenueCell}
        />
      ) : (
        <RevenueChartsView />
      )}
    </motion.div>
  );
};

export default RevenueDashboard;
