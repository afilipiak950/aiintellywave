
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";
import { Project } from '../types/project';

/**
 * Hook to fetch all projects belonging to a company
 */
export const useCompanyAllProjects = (companyId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      setError('Company ID is required');
      return;
    }
    
    fetchProjects();
  }, [companyId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[useCompanyAllProjects] Fetching projects for company: ${companyId}`);
      
      // Fetch all projects for the specified company
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          description, 
          status, 
          start_date, 
          end_date,
          assigned_to,
          created_by,
          budget
        `)
        .eq('company_id', companyId);
      
      if (projectsError) {
        console.error('[useCompanyAllProjects] Error fetching projects:', projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }
      
      if (!projectsData) {
        setProjects([]);
        return;
      }
      
      console.log(`[useCompanyAllProjects] Found ${projectsData.length} projects`);
      
      // Process the projects
      const processedProjects = projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        assigned_to: project.assigned_to,
        created_by: project.created_by,
        budget: project.budget
      }));
      
      setProjects(processedProjects);
    } catch (error: any) {
      console.error('[useCompanyAllProjects] Error:', error);
      setError(error.message || 'Failed to load projects');
      
      toast({
        title: "Error",
        description: "Failed to load company projects. Please try again.",
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
    refreshProjects: fetchProjects
  };
};
