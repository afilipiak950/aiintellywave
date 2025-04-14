
import React, { useState, useCallback, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

// Re-use the admin component since functionality is the same
const AdminManagerKPIDashboard = lazy(() => import('../Admin/ManagerKPIDashboard'));

const CustomerManagerKPIDashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    error, 
    errorStatus,
    setAttemptedRepair, 
    repairStatus, 
    companyId,
    diagnosticInfo
  } = useCompanyUserKPIs();

  // Directly check access from database on component mount
  useEffect(() => {
    const checkManagerKPIAccess = async () => {
      if (!user?.id) {
        console.error('[ManagerKPIDashboard] No user ID available for checking KPI access');
        setIsCheckingAccess(false);
        return;
      }

      try {
        console.log('[ManagerKPIDashboard] Checking KPI access for user:', user.id);
        setIsCheckingAccess(true);
        
        // Direct database query without cache-busting options
        const { data, error } = await supabase
          .from('company_users')
          .select('is_manager_kpi_enabled')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('[ManagerKPIDashboard] Error checking KPI access:', error);
          setHasAccess(false);
        } else {
          // User has access if ANY company association has the flag enabled
          const accessEnabled = data?.some(row => row.is_manager_kpi_enabled === true) || false;
          console.log('[ManagerKPIDashboard] KPI access check result:', accessEnabled, 'Data:', data);
          setHasAccess(accessEnabled);
          
          // Redirect if no access
          if (!accessEnabled) {
            console.log('[ManagerKPIDashboard] No access, redirecting to dashboard');
            toast({
              title: "Access Denied",
              description: "The Manager KPI Dashboard has been disabled for your account.",
              variant: "destructive"
            });
            navigate('/customer/dashboard');
          }
        }
      } catch (err) {
        console.error('[ManagerKPIDashboard] Unexpected error checking KPI access:', err);
        setHasAccess(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };
    
    checkManagerKPIAccess();
  }, [user, navigate]);

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

  // Show loading state while checking access
  if (isCheckingAccess) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="animate-spin h-4 w-4" />
            Checking access...
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
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

  // Debug panel in development mode
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        <div className="mb-4 p-3 bg-muted/50 rounded-md text-xs">
          <div className="mb-2 font-semibold">Debug Info:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Has Access: <span className={hasAccess ? "text-green-500" : "text-red-500"}>{hasAccess ? "Yes" : "No"}</span></div>
            <div>Company ID: {companyId || "None"}</div>
            <div>User ID: {user?.id || "Not logged in"}</div>
            <div>Refresh Count: {refreshTrigger}</div>
          </div>
          <div className="mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
              <RefreshCw className="mr-1 h-3 w-3" /> Force Refresh
            </Button>
          </div>
        </div>
        
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
      </>
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
