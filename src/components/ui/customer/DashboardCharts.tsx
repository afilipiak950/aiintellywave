
import React from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { projects } = useProjects();
  const { allLeads } = useLeads();
  const { user } = useAuth();
  const { loading } = useDashboardData(user?.id, projects, allLeads);
  
  if (loading) {
    return null;
  }
  
  return null;
};

export default CustomerDashboardCharts;
