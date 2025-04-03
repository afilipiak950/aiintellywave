
import React from 'react';
import { lazy, Suspense } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Re-use the customer component since functionality is the same
const CustomerManagerKPIDashboard = lazy(() => import('../Customer/ManagerKPIDashboard'));

const ManagerKPIDashboard = () => {
  const { 
    error, 
    errorStatus,
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
    // Force reload the current page to ensure we get fresh data
    window.location.reload();
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
        errorStatus={errorStatus} 
        onRetry={handleRetry} 
        onRepair={handleRepair}
        diagnosticInfo={diagnosticInfo}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <CustomerManagerKPIDashboard />
    </Suspense>
  );
};

export default ManagerKPIDashboard;
