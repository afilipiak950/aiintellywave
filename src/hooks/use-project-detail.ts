
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from "./use-toast";

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  company_id: string;
  company_name: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
}

export const useProjectDetail = (projectId: string) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching project details for ID: ${projectId} (attempt: ${retryCount + 1})`);
      
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      // Try to load from cache first
      const cachedProject = localStorage.getItem(`project_${projectId}`);
      let projectData = null;
      
      // Fetch the project with error handling
      const { data, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
        
      if (projectError) {
        console.error('Supabase project fetch error:', projectError);
        
        // If we have cached data, use it
        if (cachedProject) {
          projectData = JSON.parse(cachedProject);
          console.log('Using cached project data due to fetch error');
        } else {
          throw new Error(`Failed to fetch project: ${projectError.message}`);
        }
      } else if (!data && !projectData) {
        // Try alternative query approach with RPC if available
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_project_by_id', { project_id: projectId });
            
          if (rpcError) {
            console.error('RPC fetch error:', rpcError);
            throw new Error('Project not found');
          }
          
          if (rpcData) {
            projectData = rpcData;
          } else {
            throw new Error('Project not found');
          }
        } catch (rpcException) {
          console.error('No project found with ID:', projectId);
          throw new Error('Project not found');
        }
      } else {
        projectData = data;
      }
      
      if (!projectData) {
        console.error('No project data available after all fetch attempts');
        throw new Error('Project not found after multiple fetch attempts');
      }
      
      // Fetch company name with error handling
      let companyName = 'Unknown Company';
      
      try {
        if (projectData.company_id) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('name')
            .eq('id', projectData.company_id)
            .maybeSingle();
            
          if (companyData?.name) {
            companyName = companyData.name;
          }
        }
      } catch (companyError) {
        console.warn('Error fetching company name:', companyError);
        // Continue with unknown company name
      }
      
      const formattedProject = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status,
        company_id: projectData.company_id,
        company_name: companyName,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        created_at: projectData.created_at,
        updated_at: projectData.updated_at,
        assigned_to: projectData.assigned_to
      };
      
      // Cache the project data
      try {
        localStorage.setItem(`project_${projectId}`, JSON.stringify(formattedProject));
      } catch (cacheError) {
        console.warn('Failed to cache project data:', cacheError);
      }
      
      setProject(formattedProject);
      setRetryCount(0); // Reset retry count on success
      
    } catch (error: any) {
      console.error('Comprehensive project details error:', error);
      const errorMessage = error.message || 'Failed to load project details. Please try again.';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
      // Only show toast for the first error to avoid spamming
      if (retryCount === 0) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, retryCount]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    } else {
      setLoading(false);
      setError('Project ID is required');
    }
  }, [fetchProjectDetails, projectId]);

  return {
    project,
    loading,
    error,
    fetchProjectDetails,
    setProject
  };
};
