
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRevenueDashboard } from '@/hooks/revenue/use-revenue-dashboard';

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
    currentYear
  } = useRevenueDashboard(6);
  
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');
  
  // Handle cell update
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
      />

      {/* Table or Charts View */}
      {activeTab === 'table' ? (
        <RevenueTableView
          loading={loading}
          customerRows={customerRows}
          monthColumns={monthColumns}
          monthlyTotals={monthlyTotals}
          handleCellUpdate={handleCellUpdate}
        />
      ) : (
        <RevenueChartsView />
      )}
    </motion.div>
  );
};

export default RevenueDashboard;
