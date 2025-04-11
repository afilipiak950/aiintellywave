
import React, { useState, useCallback, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

// Re-use the admin component since functionality is the same
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  
  const { 
    error, 
    errorStatus,
    setAttemptedRepair, 
    repairStatus, 
    companyId,
    diagnosticInfo
  } = useCompanyUserKPIs();

  // Check if access is disabled, redirect to dashboard
  useEffect(() => {
    if (errorStatus === 'kpi_disabled') {
      toast({
        title: "Access Denied",
        description: "The Manager KPI Dashboard has been disabled for your account.",
        variant: "destructive"
      });
      navigate('/customer/dashboard');
    }
  }, [errorStatus, navigate]);
  
  const handleRetry = useCallback(() => {
    console.log("[CustomerManagerKPIDashboard] Retrying KPI dashboard load...");
    toast({
      title: "Refreshing dashboard",
      description: "Attempting to reload the dashboard data..."
    });
    setRefreshTrigger(prev => prev + 1);
  }, []);
  
  const handleRepair = useCallback(async () => {
    console.log("[CustomerManagerKPIDashboard] Attempting to repair company user association...");
    
    setAttemptedRepair(true);
    setRefreshTrigger(prev => prev + 1);
    
    toast({
      title: "Repair initiated",
      description: "Attempting to fix user-company association automatically..."
    });
  }, [setAttemptedRepair]);
  
  useEffect(() => {
    if (repairStatus === 'success') {
      toast({
        title: "Repair successful",
        description: "Your user account has been linked to a company. Reloading dashboard..."
      });
      setTimeout(handleRetry, 1500);
    } else if (repairStatus === 'failed') {
      toast({
        title: "Repair failed",
        description: "Could not automatically link your account to a company. Please contact an administrator.",
        variant: "destructive"
      });
    }
  }, [repairStatus, handleRetry]);
  
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
      <AdminManagerKPIDashboard key={refreshTrigger} />
    </Suspense>
  );
};

export default CustomerManagerKPIDashboard;
