
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export const useCompanyAllProjects = (companyId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCompanyProjects = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      setError('No company ID provided');
      console.warn('[useCompanyAllProjects] No company ID provided, cannot fetch projects');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`[useCompanyAllProjects] Fetching projects for company: ${companyId}`);
      
      // Verify that the user belongs to this company (or is admin)
      if (user && !user.is_admin) { // Changed from isAdmin to is_admin to match UserProfile type
        console.log(`[useCompanyAllProjects] Verifying user ${user.id} belongs to company ${companyId}`);
        const { data: userCompany, error: userCompanyError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .eq('company_id', companyId)
          .maybeSingle();
          
        if (userCompanyError) {
          console.error('[useCompanyAllProjects] Error verifying company access:', userCompanyError);
          throw new Error(`Access verification failed: ${userCompanyError.message}`);
        }
        
        if (!userCompany) {
          console.warn(`[useCompanyAllProjects] User ${user.id} does not have access to company ${companyId}`);
          setProjects([]);
          setError('You do not have access to projects for this company');
          setLoading(false);
          return;
        }
      }
      
      // Get projects for this specific company
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId);
        
      if (projectsError) {
        console.error('[useCompanyAllProjects] Error fetching projects:', projectsError);
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }
      
      if (!projectsData) {
        console.log('[useCompanyAllProjects] No projects found for company:', companyId);
        setProjects([]);
        return;
      }
      
      console.log(`[useCompanyAllProjects] Found ${projectsData.length} projects for company: ${companyId}`);
      
      // Calculate progress for each project
      const processedProjects = projectsData.map(project => {
        let progress = 0;
        
        if (project.status === 'completed') {
          progress = 100;
        } else if (project.status === 'in_progress') {
          progress = 50;
        } else if (project.status === 'planning') {
          progress = 10;
        }
        
        return {
          ...project,
          progress
        };
      });
      
      setProjects(processedProjects);
    } catch (err: any) {
      console.error('[useCompanyAllProjects] Error:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [companyId, user]);

  useEffect(() => {
    fetchCompanyProjects();
  }, [fetchCompanyProjects]);

  return { projects, loading, error, refetch: fetchCompanyProjects };
};
