
import React, { useState, useCallback } from 'react';
import { lazy } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';

// Import the Admin version of the Manager KPI Dashboard
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

// This is an enhanced wrapper component that includes better error handling
const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { error } = useCompanyUserKPIs();
  
  const handleRetry = useCallback(() => {
    // Trigger a refresh by updating the state which will cause the components to re-render
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // Key with refreshTrigger to force a complete remount when retrying
  return <AdminManagerKPIDashboard key={refreshTrigger} />;
};

export default CustomerManagerKPIDashboard;
