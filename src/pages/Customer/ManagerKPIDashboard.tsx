
import React, { useState, useCallback, useEffect } from 'react';
import { lazy } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAuthUser } from '@/utils/auth-utils';

const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { 
    error, 
    setAttemptedRepair, 
    repairStatus, 
    companyId,
    diagnosticInfo
  } = useCompanyUserKPIs();
  
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
        onRetry={handleRetry} 
        onRepair={handleRepair}
        diagnosticInfo={diagnosticInfo}
      />
    );
  }

  return <AdminManagerKPIDashboard key={refreshTrigger} />;
};

export default CustomerManagerKPIDashboard;
