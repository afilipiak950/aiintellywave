
import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKpiMetrics } from '@/hooks/use-kpi-metrics';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import { toast } from '@/hooks/use-toast';

// Import our components
import DashboardHeader from '@/components/manager-kpi/dashboard/DashboardHeader';
import KPIStatCards from '@/components/manager-kpi/dashboard/KPIStatCards';
import OverviewTabContent from '@/components/manager-kpi/dashboard/OverviewTabContent';
import PerformanceTabContent from '@/components/manager-kpi/dashboard/PerformanceTabContent';
import ProjectsTabContent from '@/components/manager-kpi/dashboard/ProjectsTabContent';
import ActivityTabContent from '@/components/manager-kpi/dashboard/ActivityTabContent';
import ErrorDisplay from '@/components/manager-kpi/dashboard/ErrorDisplay';

const ManagerKPIDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { metrics, loading: metricsLoading, fetchMetrics } = useKpiMetrics();
  const { 
    kpis, 
    loading: kpisLoading, 
    error: kpisError, 
    errorStatus,
    companyId,
    diagnosticInfo,
    refreshData 
  } = useCompanyUserKPIs();
  
  // Log diagnostic information for debugging
  useEffect(() => {
    if (diagnosticInfo) {
      console.log('[ManagerKPIDashboard] Diagnostic info:', diagnosticInfo);
    }
    
    if (companyId) {
      console.log('[ManagerKPIDashboard] Using company ID:', companyId);
    }
  }, [diagnosticInfo, companyId]);
  
  useEffect(() => {
    // Fetch general metrics when component mounts
    fetchMetrics(['team_members', 'projects_count', 'active_projects', 'completed_projects']);
  }, [fetchMetrics]);
  
  // Calculate team metrics
  const totalUsers = kpis.length || 0;
  const totalProjects = kpis.reduce((sum, user) => sum + Number(user.projects_count || 0), 0);
  const activeProjects = kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0);
  const completedProjects = kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0);
  
  // Handle retry functionality
  const handleRetry = useCallback(() => {
    console.log('[ManagerKPIDashboard] Attempting to retry KPI data fetch...');
    toast({
      title: "Refreshing dashboard",
      description: "Attempting to reload the dashboard data..."
    });
    refreshData();
  }, [refreshData]);
  
  // Handle repair functionality
  const handleRepair = useCallback(() => {
    console.log('[ManagerKPIDashboard] Attempting to repair company user association...');
    // This functionality is implemented in the useCompanyUserKPIs hook
  }, []);
  
  // Error handling with retry option
  if (kpisError) {
    return (
      <ErrorDisplay 
        error={kpisError} 
        errorStatus={errorStatus}
        onRetry={handleRetry} 
        onRepair={handleRepair}
        diagnosticInfo={diagnosticInfo}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />

      {/* KPI Stats Overview */}
      <KPIStatCards 
        totalUsers={totalUsers}
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        completedProjects={completedProjects}
        metrics={metrics}
        kpisLoading={kpisLoading}
      />

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <OverviewTabContent kpis={kpis} kpisLoading={kpisLoading} />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <PerformanceTabContent kpis={kpis} kpisLoading={kpisLoading} />
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <ProjectsTabContent 
            kpis={kpis} 
            kpisLoading={kpisLoading} 
            totalProjects={totalProjects}
            companyId={companyId}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <ActivityTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKPIDashboard;
