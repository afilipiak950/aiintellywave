
import React, { useState, useCallback } from 'react';
import { lazy } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';

// Import the Admin version of the Manager KPI Dashboard
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

// This is an enhanced wrapper component that includes better error handling and auto-repair
const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { 
    error, 
    setAttemptedRepair, 
    repairStatus 
  } = useCompanyUserKPIs();
  
  // Handle retry with refresh
  const handleRetry = useCallback(() => {
    console.log("[CustomerManagerKPIDashboard] Retrying KPI dashboard load...");
    // Trigger a refresh by updating the state which will cause the components to re-render
    toast({
      title: "Refreshing dashboard",
      description: "Attempting to reload the dashboard data..."
    });
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  // Handle repair attempt
  const handleRepair = useCallback(() => {
    console.log("[CustomerManagerKPIDashboard] Attempting to repair company user association...");
    // Set the flag that will trigger the repair attempt in useCompanyUserKPIs
    setAttemptedRepair(true);
    // Also refresh the component
    setRefreshTrigger(prev => prev + 1);
    
    toast({
      title: "Repair initiated",
      description: "Attempting to fix user-company association automatically..."
    });
  }, [setAttemptedRepair]);
  
  // Show appropriate UI based on repair status
  React.useEffect(() => {
    if (repairStatus === 'success') {
      toast({
        title: "Repair successful",
        description: "Your user account has been linked to a company. Reloading dashboard..."
      });
      // Refresh the dashboard after successful repair
      setTimeout(() => {
        handleRetry();
      }, 1500);
    } else if (repairStatus === 'failed') {
      toast({
        title: "Repair failed",
        description: "Could not automatically link your account to a company. Please contact an administrator.",
        variant: "destructive"
      });
    }
  }, [repairStatus, handleRetry]);
  
  if (error) {
    return <ErrorDisplay 
      error={error} 
      onRetry={handleRetry} 
      onRepair={handleRepair} 
    />;
  }

  // Key with refreshTrigger to force a complete remount when retrying
  return <AdminManagerKPIDashboard key={refreshTrigger} />;
};

export default CustomerManagerKPIDashboard;
