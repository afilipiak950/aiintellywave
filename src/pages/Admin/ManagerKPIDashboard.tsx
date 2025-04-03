
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKpiMetrics } from '@/hooks/use-kpi-metrics';
import { useCompanyUserKPIs } from '@/hooks/use-company-user-kpis';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BarChart, Users, FolderKanban, CheckSquare } from 'lucide-react';
import StatCard from '@/components/ui/dashboard/StatCard';

const ManagerKPIDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { metrics, loading: metricsLoading, fetchMetrics } = useKpiMetrics();
  const { kpis, loading: kpisLoading, error: kpisError } = useCompanyUserKPIs();
  
  useEffect(() => {
    // Fetch general metrics when component mounts
    fetchMetrics(['team_members', 'projects_count', 'active_projects', 'completed_projects']);
  }, [fetchMetrics]);
  
  // Calculate team metrics
  const totalUsers = kpis.length || 0;
  const totalProjects = kpis.reduce((sum, user) => sum + Number(user.projects_count || 0), 0);
  const activeProjects = kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0);
  const completedProjects = kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0);
  
  // Error handling
  if (kpisError) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{kpisError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manager KPI Dashboard</h1>
          <p className="text-muted-foreground">Monitor your team's performance and projects</p>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Team Members" 
          value={kpisLoading ? "..." : totalUsers.toString()} 
          icon={<Users className="h-5 w-5" />}
          loading={kpisLoading}
          change={metrics['team_members'] ? { 
            value: '0', 
            isPositive: metrics['team_members'].value >= (metrics['team_members'].previous_value || 0) 
          } : undefined}
        />
        <StatCard 
          title="Total Projects" 
          value={kpisLoading ? "..." : totalProjects.toString()} 
          icon={<FolderKanban className="h-5 w-5" />}
          loading={kpisLoading}
          change={metrics['projects_count'] ? { 
            value: '0', 
            isPositive: metrics['projects_count'].value >= (metrics['projects_count'].previous_value || 0) 
          } : undefined}
        />
        <StatCard 
          title="Active Projects" 
          value={kpisLoading ? "..." : activeProjects.toString()} 
          icon={<BarChart className="h-5 w-5" />}
          loading={kpisLoading}
          change={metrics['active_projects'] ? { 
            value: '0', 
            isPositive: metrics['active_projects'].value >= (metrics['active_projects'].previous_value || 0) 
          } : undefined}
        />
        <StatCard 
          title="Completed Projects" 
          value={kpisLoading ? "..." : completedProjects.toString()} 
          icon={<CheckSquare className="h-5 w-5" />}
          loading={kpisLoading}
          change={metrics['completed_projects'] ? { 
            value: '0', 
            isPositive: metrics['completed_projects'].value >= (metrics['completed_projects'].previous_value || 0) 
          } : undefined}
        />
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
              <div className="space-y-4">
                {kpisLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                ) : kpis.length === 0 ? (
                  <p className="text-muted-foreground">No team members data available.</p>
                ) : (
                  <div className="divide-y">
                    {kpis.map((user) => (
                      <div key={user.user_id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.full_name || user.email}</p>
                          <p className="text-sm text-gray-500">{user.role || 'Team Member'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{user.projects_count || 0} Projects</p>
                          <p className="text-sm text-gray-500">
                            {user.leads_count || 0} Leads / {user.appointments_count || 0} Appointments
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status Distribution</h3>
              {kpisLoading ? (
                <div className="animate-pulse flex flex-col space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">{kpis.reduce((sum, user) => sum + Number(user.projects_planning || 0), 0)}</p>
                      <p className="text-sm text-blue-600">Planning</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-amber-700">{kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0)}</p>
                      <p className="text-sm text-amber-600">Active</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0)}</p>
                      <p className="text-sm text-green-600">Completed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Team Performance Metrics</h3>
            {kpisLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ) : kpis.length === 0 ? (
              <p className="text-muted-foreground">No performance data available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kpis.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || 'Unnamed'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.projects_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.projects_active || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.projects_completed || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.leads_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.appointments_count || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">All Projects</h3>
            {kpisLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ) : kpis.length === 0 ? (
              <p className="text-muted-foreground">No projects data available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* This would ideally fetch real projects data from a separate API call */}
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium text-lg">Project Data</h4>
                  <p className="text-gray-500">To display actual projects, implement a separate hook that fetches detailed project information.</p>
                </div>
                
                <div className="border p-4 rounded-lg">
                  <h4 className="font-medium">Project Distribution</h4>
                  <p className="text-lg font-medium mt-2">
                    Total: {totalProjects} projects
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Planning:</span>
                      <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_planning || 0), 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Active:</span>
                      <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_active || 0), 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Completed:</span>
                      <span className="font-medium">{kpis.reduce((sum, user) => sum + Number(user.projects_completed || 0), 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <p className="text-muted-foreground mb-4">
              This section would display recent activities from users in your company.
              It requires implementing a separate data fetch for activities or events.
            </p>
            
            <div className="border rounded-md p-4 bg-amber-50 text-amber-800">
              <p className="font-medium">Implementation Note</p>
              <p className="text-sm mt-1">
                To display real activity data, create a function that queries recent events
                from projects, leads, and other relevant tables in your database.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerKPIDashboard;
