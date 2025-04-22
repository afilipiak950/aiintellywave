
import React from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  
  // Use the dashboard data hook to process the data
  const { loading, leadsByStatus, leadsByProject } = useDashboardData(user?.id, projects, allLeads);
  
  // If there's no chart data to display or we're not in loading state, return null
  if (!loading && (!leadsByStatus?.length || !leadsByProject?.length)) {
    return null;
  }
  
  // If loading and we have data to potentially show, show a loader
  if (loading || leadsLoading || projectsLoading) {
    return null; // Don't show loader at all to avoid the "Loading chart data..." message
  }
  
  // We shouldn't reach here based on current conditions, but this is a fallback
  return null;
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CustomerDashboardCharts);
