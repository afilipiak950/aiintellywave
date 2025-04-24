
import { useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { toast } from '../use-toast';
import { cacheUtils } from '../../utils/cache-utils';
import { PipelineHookReturn } from './types';
import { fetchCompanyProjects, updateProjectStatus } from './pipeline-db';
import { usePipelineState } from './use-pipeline-state';
import { mapProjectStatus } from './project-utils';

export const usePipeline = (): PipelineHookReturn => {
  const { user } = useAuth();
  const { state, updateState } = usePipelineState();
  
  const fetchPipelineData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      updateState({ loading: false, error: "User authentication required" });
      return;
    }

    if (!forceRefresh) {
      const cachedData = cacheUtils.get('projects');
      if (cachedData) {
        console.log('Loading pipeline data from cache:', cachedData.length, 'projects');
        updateState({ projects: cachedData, loading: false });
        return;
      }
    }

    updateState({ isRefreshing: true, error: null });

    try {
      // Get user's company ID first
      const { data: companyData } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      const companyId = companyData?.company_id;
      
      if (!companyId) {
        throw new Error('No company association found');
      }

      const projects = await fetchCompanyProjects(companyId);
      
      updateState({ 
        projects,
        loading: false,
        isRefreshing: false,
        error: null,
        lastRefreshTime: new Date()
      });
      
      cacheUtils.set('projects', projects);
    } catch (error: any) {
      console.error('Error in usePipeline:', error);
      updateState({
        error: 'Failed to load pipeline data. Please try again.',
        loading: false,
        isRefreshing: false
      });
    }
  }, [user, updateState]);

  const updateProjectStage = useCallback(async (projectId: string, newStageId: string) => {
    const prevProjects = [...state.projects];
    
    // Optimistically update UI
    updateState({
      projects: prevProjects.map(project =>
        project.id === projectId ? { ...project, stageId: newStageId } : project
      )
    });
    
    try {
      // Map stage to status
      let status: string;
      switch(newStageId) {
        case 'project_start': status = 'planning'; break;
        case 'candidates_found': 
        case 'contact_made':
        case 'interviews_scheduled': status = 'in_progress'; break;
        case 'final_review': status = 'review'; break;
        case 'completed': status = 'completed'; break;
        default: status = 'planning';
      }
      
      await updateProjectStatus(projectId, status);
      
      // Update cache with new data
      cacheUtils.set('projects', state.projects);
      
      toast({
        title: "Success",
        description: "Project stage updated successfully.",
      });
    } catch (error) {
      console.error('Error updating project stage:', error);
      // Revert changes on error
      updateState({ projects: prevProjects });
      cacheUtils.clear('projects');
      
      toast({
        title: "Error",
        description: "Failed to update project stage.",
        variant: "destructive"
      });
    }
  }, [state.projects, updateState]);

  // Filter projects based on search and company filter
  const filteredProjects = useMemo(() => {
    return state.projects.filter(project => {
      const matchesSearch = !state.searchTerm || 
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCompany = !state.filterCompanyId || 
        project.company_id === state.filterCompanyId;
      return matchesSearch && matchesCompany;
    });
  }, [state.projects, state.searchTerm, state.filterCompanyId]);

  // Initial data fetch
  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    ...state,
    projects: filteredProjects,
    setSearchTerm: (term: string) => updateState({ searchTerm: term }),
    setFilterCompanyId: (id: string | null) => updateState({ filterCompanyId: id }),
    updateProjectStage,
    refetch: () => {
      cacheUtils.clear('projects');
      return fetchPipelineData(true);
    }
  };
};
