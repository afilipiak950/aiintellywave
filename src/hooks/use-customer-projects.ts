
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { toast } from './use-toast';
import { getProgressByStatus } from '../utils/project-status';

export interface CustomerProject {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  company_name: string;
  progress: number;
  start_date: string | null;
  end_date: string | null;
  assigned_to: string | null;
}

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching customer projects for user:', user.id);
      
      // Fetch projects where either:
      // 1. The project belongs to the customer's company
      // 2. The project is assigned to the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          description, 
          status, 
          company_id,
          start_date, 
          end_date,
          assigned_to
        `)
        .or(`company_id.eq.${user.companyId},assigned_to.eq.${user.id}`);
        
      if (projectsError) {
        console.error('Error fetching customer projects:', projectsError);
        throw projectsError;
      }
      
      console.log('Customer projects received:', projectsData);
      
      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }
      
      // Get company names for the projects
      const companyIds = [...new Set(projectsData.map(p => p.company_id))];
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds);
        
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }
      
      // Create a lookup map for company names
      const companyNameMap: Record<string, string> = {};
      companiesData?.forEach(company => {
        companyNameMap[company.id] = company.name;
      });
      
      // Map projects with company names and progress
      const processedProjects = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        company_id: project.company_id,
        company_name: companyNameMap[project.company_id] || 'Unknown Company',
        progress: getProgressByStatus(project.status),
        start_date: project.start_date,
        end_date: project.end_date,
        assigned_to: project.assigned_to
      }));
      
      // Debug output to verify assigned projects are included
      const assignedProjects = processedProjects.filter(p => p.assigned_to === user.id);
      console.log(`Found ${assignedProjects.length} projects assigned to current user:`, 
        assignedProjects.map(p => p.name));
        
      setProjects(processedProjects);
      
    } catch (error: any) {
      console.error('Error in useCustomerProjects:', error);
      setError(error.message || 'Failed to load projects');
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects
  };
};
