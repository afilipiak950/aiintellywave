
import React from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  
  // Currently dashboard charts are disabled, but we ensure no errors occur
  return null;
};

// React.memo to avoid unnecessary re-renders
export default React.memo(CustomerDashboardCharts);
