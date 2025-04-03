
import React, { useState, useCallback, useEffect } from 'react';
import { lazy } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAuthUser } from '@/utils/auth-utils';

// Import the Admin version of the Manager KPI Dashboard
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

// This is an enhanced wrapper component that includes better error handling and auto-repair
const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [isCheckingAssociations, setIsCheckingAssociations] = useState(false);
  
  const { 
    error, 
    setAttemptedRepair, 
    repairStatus, 
    companyId
  } = useCompanyUserKPIs();
  
  // Function to check company associations directly
  const checkCompanyAssociations = async () => {
    try {
      setIsCheckingAssociations(true);
      
      // Get current user
      const user = await getAuthUser();
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      // Call our diagnostic function
      const { data: associations, error: diagError } = await supabase
        .rpc('check_user_company_associations', { 
          user_id_param: user.id 
        });
      
      if (diagError) {
        console.error('Error checking company associations:', diagError);
        throw diagError;
      }
      
      console.log('Company associations found:', associations);
      
      // Check direct query to company_users as a fallback
      const { data: directCompanyUsers, error: directError } = await supabase
        .from('company_users')
        .select('company_id, role, email, is_admin, is_manager_kpi_enabled, companies:company_id(name)')
        .eq('user_id', user.id);
        
      if (directError) {
        console.error('Error direct query to company_users:', directError);
      }
      
      setDiagnosticInfo({
        userId: user.id,
        userEmail: user.email,
        associations: associations,
        directQuery: directCompanyUsers,
        timestamp: new Date().toISOString(),
        companyIdFromHook: companyId
      });
      
      if (associations && associations.length > 0) {
        toast({
          title: "Company associations found",
          description: `Found ${associations.length} company associations. Dashboard should work.`,
        });
      } else {
        toast({
          title: "No company associations found",
          description: "No company associations were found for your user in the database.",
          variant: "destructive"
        });
      }
      
      return associations;
    } catch (err: any) {
      console.error('Error in checkCompanyAssociations:', err);
      toast({
        title: "Error checking associations",
        description: err.message || "Could not check company associations",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCheckingAssociations(false);
    }
  };
  
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
  const handleRepair = useCallback(async () => {
    console.log("[CustomerManagerKPIDashboard] Attempting to repair company user association...");
    
    // First check if we actually have company associations
    const associations = await checkCompanyAssociations();
    
    if (associations && associations.length > 0) {
      // If we have associations but still getting error, it might be an RLS or permission issue
      toast({
        title: "Company association exists",
        description: "Your user account is already linked to a company, but there may be a permission issue.",
      });
    }
    
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
  useEffect(() => {
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

  // Run diagnostic check when component mounts or refreshes
  useEffect(() => {
    if (error) {
      checkCompanyAssociations();
    }
  }, [error, refreshTrigger]);
  
  if (error) {
    return (
      <>
        <ErrorDisplay 
          error={error} 
          onRetry={handleRetry} 
          onRepair={handleRepair}
          isCheckingAssociations={isCheckingAssociations}
          onCheckAssociations={checkCompanyAssociations}
          diagnosticInfo={diagnosticInfo}
        />
      </>
    );
  }

  // Key with refreshTrigger to force a complete remount when retrying
  return <AdminManagerKPIDashboard key={refreshTrigger} />;
};

export default CustomerManagerKPIDashboard;
