
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';
import { useDashboardData } from './dashboard/useDashboardData';

const CustomerDashboardCharts: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  
  // Use the dashboard data hook to process the data
  const { 
    loading, 
    leadsByStatus, 
    leadsByProject,
    totalLeads,
    totalAllLeads 
  } = useDashboardData(user?.id, projects, allLeads);
  
  // Memoize the title to prevent unnecessary re-renders
  const chartTitle = useMemo(() => {
    if (loading || leadsLoading || projectsLoading) {
      return 'Loading chart data...';
    }
    
    if (totalLeads === 0) {
      return 'No lead data available yet';
    }
    
    return `Lead Distribution (${totalLeads} total leads)`;
  }, [loading, leadsLoading, projectsLoading, totalLeads]);
  
  // If there's no data to display, show a loader
  if ((loading || leadsLoading || projectsLoading) && (!leadsByStatus || leadsByStatus.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all">
        <div className="flex flex-col items-center justify-center h-60">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }
  
  // Render charts even if there are no leads
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Distribution Pie Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Lead Status Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leadsByStatus.length > 0 ? leadsByStatus : [{ name: 'No Data', value: 1 }]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${leadsByStatus.length > 0 ? (percent * 100).toFixed(0) : 0}%`}
              >
                {(leadsByStatus.length > 0 ? leadsByStatus : [{ color: '#e0e0e0' }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#e0e0e0'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} leads`, 'Count']}
                labelFormatter={(name) => `Status: ${name}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Project Distribution Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Leads by Project</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={leadsByProject.length > 0 ? leadsByProject : [{ name: 'No Data', leads: 1 }]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
              <Legend />
              <Bar dataKey="leads" name="Leads" fill="#8884d8">
                {(leadsByProject.length > 0 ? leadsByProject : [{ color: '#e0e0e0' }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#e0e0e0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CustomerDashboardCharts);
