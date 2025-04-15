
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  
  // Use the dashboard data hook to process the data
  const { loading } = useDashboardData(user?.id, projects, allLeads);
  
  // If loading, show a loader
  if (loading || leadsLoading || projectsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all">
        <div className="flex flex-col items-center justify-center h-60">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }
  
  // Currently no charts to render
  return null;
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CustomerDashboardCharts);
