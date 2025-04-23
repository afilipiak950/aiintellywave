
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

  // Simplified fetch function
  const fetchPipelineData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Fetching pipeline data for user:', user.id);
      
      // Simple approach - get the user's company ID first
      const { data: companyData } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      
      const companyId = companyData?.company_id;
      
      if (!companyId) {
        setError('No company association found');
        setLoading(false);
        return;
      }
      
      // Then fetch all projects for that company
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId);
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        setError(projectsError.message);
        setLoading(false);
        return;
      }
      
      // Get company name
      const { data: companyInfo } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
      
      const companyName = companyInfo?.name || 'Unknown Company';
      
      // Convert projects to pipeline format
      if (projectsData) {
        const pipelineProjects: PipelineProject[] = projectsData.map(project => {
          // Assign a default stage based on status
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
            hasUpdates: false // Simplified - removing the "recently updated" check
          };
        });
        
        setProjects(pipelineProjects);
        setError(null);
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error in usePipeline:', error);
      setError(error.message);
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
      setProjects(projects);
    }
  };
  
  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    projects: projects.filter(project => {
      // Simple filtering logic
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
