import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/use-projects';
import { useLeads } from '@/hooks/leads/use-leads';
import { useAuth } from '@/context/auth';

interface Lead {
  id: string;
  name: string;
  status: string;
  company?: string;
  score?: number;
  project_id?: string;
  extra_data?: { [key: string]: any; source?: string; };
}

interface Project {
  id: string;
  name: string;
  status: string;
  company_id: string;
}

interface LeadsByStatusData {
  name: string;
  value: number;
  color: string;
}

interface LeadsByProjectData {
  name: string;
  leads: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];
const STATUS_COLORS: Record<string, string> = {
  new: '#0088FE',
  contacted: '#00C49F',
  qualified: '#FFBB28',
  proposal: '#FF8042',
  negotiation: '#8884D8',
  won: '#48C9B0',
  lost: '#A569BD'
};

const CustomerDashboardCharts: React.FC = () => {
  const { projects, loading: projectsLoading } = useProjects();
  const { allLeads, loading: leadsLoading } = useLeads();
  const { user } = useAuth();
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatusData[]>([]);
  const [leadsByProject, setLeadsByProject] = useState<LeadsByProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalAllLeads, setTotalAllLeads] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching company ID:', error);
          return;
        }
        
        if (data && data.company_id) {
          setCompanyId(data.company_id);
          console.log('Dashboard charts: Retrieved company ID:', data.company_id);
        }
      } catch (error) {
        console.error('Error in fetchCompanyId:', error);
      }
    };
    
    fetchCompanyId();
  }, [user]);
  
  const filteredLeads = useMemo(() => {
    if (!allLeads || !projects || !companyId) return [];
    
    const companyProjects = projects.filter(project => project.company_id === companyId);
    const companyProjectIds = companyProjects.map(project => project.id);
    
    return allLeads.filter(lead => 
      lead.project_id && companyProjectIds.includes(lead.project_id)
    );
  }, [allLeads, projects, companyId]);
  
  useEffect(() => {
    if (!leadsLoading && !projectsLoading) {
      processLeadData();
    }
  }, [filteredLeads, projects, leadsLoading, projectsLoading, allLeads, companyId]);
  
  const processLeadData = () => {
    if (!filteredLeads || !projects) {
      setLeadsByStatus([]);
      setLeadsByProject([]);
      setLoading(false);
      return;
    }
    
    const leadsCount = filteredLeads.length;
    setTotalLeads(leadsCount);
    
    setTotalAllLeads(allLeads?.length || 0);
    
    console.log(`Processing ${leadsCount} leads for dashboard charts after filtering by company projects`);
    console.log(`Total leads in system: ${allLeads?.length || 0}`);
    
    const statusCounts: Record<string, number> = {};
    
    filteredLeads.forEach((lead: any) => {
      const status = lead.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusData = Object.entries(statusCounts).map(([status, count], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: STATUS_COLORS[status] || COLORS[index % COLORS.length]
    }));
    
    console.log('Status counts data:', statusData);
    
    if (companyId) {
      const projectCounts: Record<string, number> = {};
      const projectNames: Record<string, string> = {};
      
      const companyProjects = projects.filter(project => project.company_id === companyId);
      
      companyProjects.forEach((project: Project) => {
        projectNames[project.id] = project.name;
        projectCounts[project.id] = 0;
      });
      
      filteredLeads.forEach((lead: any) => {
        if (lead.project_id && projectNames[lead.project_id]) {
          projectCounts[lead.project_id] = (projectCounts[lead.project_id] || 0) + 1;
        }
      });
      
      const projectData = Object.entries(projectCounts)
        .filter(([_, count]) => count > 0)
        .map(([projectId, count], index) => ({
          name: projectNames[projectId] || `Project ${projectId.slice(0, 5)}...`,
          leads: count,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5);
      
      console.log('Project lead counts data:', projectData);
      setLeadsByProject(projectData);
    }
    
    setLeadsByStatus(statusData);
    setLoading(false);
  };
  
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
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-700">Your Company Leads</h3>
            <p className="text-3xl font-bold">{totalLeads}</p>
            <p className="text-sm text-gray-500">Leads in your company projects</p>
          </div>
          <div className="border p-4 rounded-lg bg-green-50">
            <h3 className="text-lg font-semibold text-green-700">Total Database</h3>
            <p className="text-3xl font-bold">{totalAllLeads}</p>
            <p className="text-sm text-gray-500">Total leads in the system</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Leads by Status</h3>
          
          {leadsByStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-sm">No lead data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} leads`, 'Count']} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-200 shadow-sm">
                            <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value} leads (${((payload[0].value / totalLeads) * 100).toFixed(0)}%)`}</p>
                            <p className="text-xs text-gray-500">{`Total: ${totalLeads} leads`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Projects by Lead Count</h3>
          
          {leadsByProject.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="text-sm">No project data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadsByProject}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value} leads`, 'Count']} />
                  <Bar dataKey="leads">
                    {leadsByProject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardCharts;
