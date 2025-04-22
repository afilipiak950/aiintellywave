
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
  
  // Keine Daten und keine Ladeanimation anzeigen, wenn keine Chart-Daten verfügbar sind
  if (!loading && (!leadsByStatus?.length || !leadsByProject?.length)) {
    return null;
  }
  
  // Keine Ladeanimation anzeigen, wenn Daten geladen werden
  if (loading || leadsLoading || projectsLoading) {
    return null;
  }
  
  // Falls wir hierher kommen (was unwahrscheinlich ist), geben wir null zurück
  return null;
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CustomerDashboardCharts);
