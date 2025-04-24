import { useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { toast } from '../use-toast';
import { cacheUtils } from '../../utils/cache-utils';
import { PipelineHookReturn } from './types';
import { fetchCompanyProjects, updateProjectStatus } from './pipeline-db';
import { usePipelineState } from './use-pipeline-state';
import { supabase } from '../../integrations/supabase/client';

export const usePipeline = (): PipelineHookReturn => {
  const { user } = useAuth();
  const { state, updateState } = usePipelineState();
  
  const fetchPipelineData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      updateState({ loading: false });
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

    updateState({ isRefreshing: true });

    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*, companies(name)')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        stageId: project.status,
        company: project.companies?.name || 'Unknown Company',
        company_id: project.company_id,
        updated_at: project.updated_at,
        status: project.status,
        progress: getProgressByStatus(project.status),
        hasUpdates: false
      }));
      
      updateState({ 
        projects: formattedProjects,
        loading: false,
        isRefreshing: false,
        lastRefreshTime: new Date()
      });
      
      cacheUtils.set('projects', formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      updateState({
        loading: false,
        isRefreshing: false
      });

      toast({
        title: "Sync Error",
        description: "Projects could not be synchronized. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, updateState]);

  const updateProjectStage = useCallback(async (projectId: string, newStageId: string) => {
    const prevProjects = [...state.projects];
    
    updateState({
      projects: prevProjects.map(project =>
        project.id === projectId ? { ...project, stageId: newStageId } : project
      )
    });
    
    try {
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
      
      cacheUtils.set('projects', state.projects);
      
      toast({
        title: "Erfolg",
        description: "Projektstatus wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating project stage:', error);
      updateState({ projects: prevProjects });
      cacheUtils.clear('projects');
      
      toast({
        title: "Fehler",
        description: "Projektstatus konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  }, [state.projects, updateState]);

  const filteredProjects = useMemo(() => {
    return state.projects.filter(project => {
      const matchesSearch = !state.searchTerm || 
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCompany = !state.filterCompanyId || 
        project.company_id === state.filterCompanyId;
      return matchesSearch && matchesCompany;
    });
  }, [state.projects, state.searchTerm, state.filterCompanyId]);

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

const getProgressByStatus = (status: string): number => {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    case 'canceled': return 0;
    default: return 0;
  }
};
