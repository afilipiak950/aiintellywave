
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/auth';
import { PipelineProject, DEFAULT_PIPELINE_STAGES, PipelineStage } from '../types/pipeline';
import { toast } from './use-toast';
import { supabase } from '../integrations/supabase/client';

export const usePipeline = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [stages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);

  // Fetch pipeline data from the database
  const fetchPipelineData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User authentication required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching pipeline data for user:', user.id);
      
      // Try first approach: Get user's company via company_users table
      let companyId: string | null = null;
      let companyName = 'Your Company';

      try {
        // Get the user's company ID first
        const { data: companyData, error: companyError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .single();
        
        if (companyError) {
          console.error('Error fetching company association:', companyError);
          
          // If we get infinite recursion error, try fallback approach
          if (companyError.code === '42P17' || companyError.message?.includes('infinite recursion')) {
            throw new Error('RLS policy error, trying fallback');
          }
          
          setError('Failed to load company association. Please refresh and try again.');
          setLoading(false);
          return;
        }
        
        companyId = companyData?.company_id;
      } catch (e) {
        console.log('Using fallback method to fetch company ID due to RLS issues');
        
        // Fallback: Try direct query to projects table
        const { data: projectsData } = await supabase
          .from('projects')
          .select('company_id')
          .limit(1);
          
        if (projectsData && projectsData.length > 0) {
          companyId = projectsData[0].company_id;
          console.log('Found company ID via projects table:', companyId);
        } else {
          // Try other tables that might have company info
          const { data: companyUsersData } = await supabase
            .rpc('get_user_company_id', { user_id_param: user.id });
            
          if (companyUsersData) {
            companyId = companyUsersData;
            console.log('Found company ID via RPC function:', companyId);
          }
        }
      }
      
      if (!companyId) {
        setError('No company association found. Please contact your administrator.');
        setLoading(false);
        return;
      }
      
      console.log('Using company ID:', companyId);
      
      // Then fetch all projects for that company
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId);
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setError('Failed to load projects. Please try again.');
        setLoading(false);
        return;
      }
      
      try {
        // Get company name
        const { data: companyInfo } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyId)
          .single();
        
        if (companyInfo) {
          companyName = companyInfo.name;
        }
      } catch (err) {
        console.warn('Could not fetch company name, using default');
      }
      
      // Convert projects to pipeline format
      if (projectsData && Array.isArray(projectsData)) {
        console.log(`Found ${projectsData.length} projects for company ${companyId}`);
        
        const pipelineProjects: PipelineProject[] = projectsData.map(project => {
          // Assign a stage based on status
          let stageId;
          if (project.status === 'planning') stageId = 'project_start';
          else if (project.status === 'in_progress') stageId = 'candidates_found';
          else if (project.status === 'review') stageId = 'final_review';
          else if (project.status === 'completed') stageId = 'completed';
          else stageId = 'project_start';
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            stageId,
            company: companyName,
            company_id: companyId,
            updated_at: project.updated_at,
            status: project.status,
            progress: getProgressByStatus(project.status),
            hasUpdates: false
          };
        });
        
        setProjects(pipelineProjects);
        setError(null);
      } else {
        console.warn('No projects found or data is not in expected format:', projectsData);
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error in usePipeline:', error);
      
      // More user-friendly error message
      if (error.message?.includes('infinite recursion')) {
        setError('Database access issue. We\'re working on fixing this. Please try again in a few moments.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProjectStage = async (projectId: string, newStageId: string) => {
    // Find the project and update its stage
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, stageId: newStageId } : project
    );
    
    // Optimistically update UI
    setProjects(updatedProjects);
    
    try {
      // Map stage to status
      let status = 'planning';
      if (newStageId === 'project_start') status = 'planning';
      else if (['candidates_found', 'contact_made', 'interviews_scheduled'].includes(newStageId)) status = 'in_progress';
      else if (newStageId === 'final_review') status = 'review';
      else if (newStageId === 'completed') status = 'completed';
      
      // Update in database
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Project moved to new stage.",
      });
    } catch (error: any) {
      console.error('Error updating project stage:', error);
      toast({
        title: "Error",
        description: "Failed to update project stage.",
        variant: "destructive"
      });
      
      // Revert changes on error
      fetchPipelineData();
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    projects: projects.filter(project => {
      // Apply filters only if they're set
      return (!searchTerm || project.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
             (!filterCompanyId || project.company_id === filterCompanyId);
    }),
    stages,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage,
    refetch: fetchPipelineData
  };
};

// Helper to calculate progress based on status
const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    default: return 0;
  }
};
