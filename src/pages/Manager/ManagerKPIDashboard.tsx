
import React from 'react';
import { lazy } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';

// Re-use the customer component since functionality is the same
const CustomerManagerKPIDashboard = lazy(() => import('../Customer/ManagerKPIDashboard'));

const ManagerKPIDashboard = () => {
  const { 
    error, 
    setAttemptedRepair, 
    repairStatus, 
    diagnosticInfo
  } = useCompanyUserKPIs();
  
  const handleRetry = () => {
    console.log("[ManagerKPIDashboard] Retrying KPI dashboard load...");
    toast({
      title: "Refreshing dashboard",
      description: "Attempting to reload the dashboard data..."
    });
  };
  
  const handleRepair = async () => {
    console.log("[ManagerKPIDashboard] Attempting to repair company user association...");
    
    setAttemptedRepair(true);
    
    toast({
      title: "Repair initiated",
      description: "Attempting to fix user-company association automatically..."
    });
  };
  
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        onRetry={handleRetry} 
        onRepair={handleRepair}
        diagnosticInfo={diagnosticInfo}
      />
    );
  }

  return <CustomerManagerKPIDashboard />;
};

export default ManagerKPIDashboard;
