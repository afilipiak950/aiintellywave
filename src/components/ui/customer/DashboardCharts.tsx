
import React from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  
  // Im Moment sind die Diagramme deaktiviert, aber wir stellen sicher, dass keine Fehler verursacht werden
  return null;
};

// React.memo verwenden, um unnötige Neuberechnungen zu vermeiden
export default React.memo(CustomerDashboardCharts);
