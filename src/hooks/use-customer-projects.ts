
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { toast } from '../hooks/use-toast';
import { getProgressByStatus } from '../utils/project-utils';

export interface CustomerProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
}

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Fetching customer projects for user:', user.id);
      
      // First, get the company ID for the current user
      const { data: companyUserData, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (companyUserError) {
        console.error('Error fetching company ID:', companyUserError);
        throw new Error(`Failed to fetch company ID: ${companyUserError.message}`);
      }
      
      const companyId = companyUserData?.company_id;
      
      if (!companyId) {
        console.log('No company ID found for user, checking assigned projects');
        
        // If no company ID, try to get projects assigned directly to the user
        const { data: assignedProjects, error: assignedProjectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (assignedProjectsError) {
          console.error('Error fetching assigned projects:', assignedProjectsError);
          throw new Error(`Failed to fetch assigned projects: ${assignedProjectsError.message}`);
        }
        
        if (assignedProjects && assignedProjects.length > 0) {
          const formattedProjects = assignedProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status,
            progress: getProgressByStatus(project.status)
          }));
          
          console.log('Found assigned projects:', formattedProjects.length);
          setProjects(formattedProjects);
        } else {
          console.log('No assigned projects found');
          setProjects([]);
        }
      } else {
        console.log('Found company ID:', companyId);
        
        // Fetch projects for the company
        const { data: companyProjects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('company_id', companyId);
          
        if (projectsError) {
          console.error('Error fetching company projects:', projectsError);
          throw new Error(`Failed to fetch company projects: ${projectsError.message}`);
        }
        
        if (companyProjects && companyProjects.length > 0) {
          const formattedProjects = companyProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status,
            progress: getProgressByStatus(project.status)
          }));
          
          console.log('Found company projects:', formattedProjects.length);
          setProjects(formattedProjects);
        } else {
          console.log('No company projects found');
          setProjects([]);
        }
      }
    } catch (error: any) {
      console.error('Error in useCustomerProjects:', error);
      setError(error.message || 'Failed to load projects');
      
      toast({
        title: "Fehler",
        description: "Projekte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, retryCount]);

  const retryFetchProjects = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, fetchProjects, retryFetchProjects };
};
