
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, Project, LeadsByStatusData, LeadsByProjectData, COLORS, STATUS_COLORS } from './types';

export const useDashboardData = (
  userId: string | undefined, 
  projects: Project[] | undefined, 
  allLeads: Lead[] | undefined
) => {
  const [leadsByStatus, setLeadsByStatus] = useState<LeadsByStatusData[]>([]);
  const [leadsByProject, setLeadsByProject] = useState<LeadsByProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalAllLeads, setTotalAllLeads] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Fetch company ID for the current user
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userId)
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
  }, [userId]);
  
  // Filter leads by company projects
  const filteredLeads = useMemo(() => {
    if (!allLeads || !projects || !companyId) return [];
    
    const companyProjects = projects.filter(project => project.company_id === companyId);
    const companyProjectIds = companyProjects.map(project => project.id);
    
    return allLeads.filter(lead => 
      lead.project_id && companyProjectIds.includes(lead.project_id)
    );
  }, [allLeads, projects, companyId]);
  
  // Process lead data whenever dependencies change
  useEffect(() => {
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
      
      if (leadsCount === 0) {
        setLeadsByStatus([]);
        setLeadsByProject([]);
        setLoading(false);
        return;
      }
      
      // Process leads by status
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
      setLeadsByStatus(statusData);
      
      // Process leads by project
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
      
      setLoading(false);
    };
    
    if (filteredLeads !== undefined && projects !== undefined) {
      processLeadData();
    }
  }, [filteredLeads, projects, allLeads, companyId]);
  
  return {
    loading,
    leadsByStatus,
    leadsByProject,
    totalLeads,
    totalAllLeads,
    companyId
  };
};
