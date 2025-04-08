
import React from 'react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import NoDataMessage from './dashboard/NoDataMessage';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { projects } = useProjects();
  const { allLeads } = useLeads();
  const { user } = useAuth();
  const { loading } = useDashboardData(user?.id, projects, allLeads);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-40 w-40 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm h-80 flex items-center justify-center">
          <div className="animate-pulse w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-4">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Dashboard Overview</h3>
        <NoDataMessage message="No dashboard data available" />
      </div>
    </div>
  );
};

export default CustomerDashboardCharts;
