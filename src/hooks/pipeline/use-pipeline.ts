
import { useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { toast } from '../use-toast';
import { cacheUtils } from '../../utils/cache-utils';
import { PipelineHookReturn } from './types';
import { usePipelineState } from './use-pipeline-state';
import { supabase } from '../../integrations/supabase/client';
import { DEFAULT_PIPELINE_STAGES } from '../../types/pipeline';
import { fetchCompanyProjects } from './pipeline-db';

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

    updateState({ isRefreshing: true, error: null });

    try {
      console.log('Fetching projects for pipeline...');
      
      // First get the user's company ID
      const { data: userData, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', user.id)
        .maybeSingle(); // Using maybeSingle instead of single to handle no results gracefully
      
      if (userError) {
        console.error('Error fetching user company:', userError);
        throw userError;
      }
      
      if (!userData || !userData.company_id) {
        console.warn('No company associated with this user');
        updateState({
          projects: [],
          stages: DEFAULT_PIPELINE_STAGES,
          loading: false,
          isRefreshing: false,
          lastRefreshTime: new Date(),
          error: 'No company associated with this user'
        });
        return;
      }
      
      console.log('Fetching projects for company ID:', userData.company_id);
      
      // Try using the fetchCompanyProjects function which has better error handling
      try {
        const companyProjects = await fetchCompanyProjects(userData.company_id);
        
        console.log('Fetched projects for pipeline:', companyProjects?.length || 0);

        updateState({ 
          projects: companyProjects,
          stages: DEFAULT_PIPELINE_STAGES,
          loading: false,
          isRefreshing: false,
          lastRefreshTime: new Date()
        });
        
        cacheUtils.set('projects', companyProjects);
        
      } catch (companyProjectsError) {
        // Fallback to the old method if the new one fails
        console.log('Falling back to direct query due to error:', companyProjectsError);
        
        // Now fetch projects for this company
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*, companies(name)')
          .eq('company_id', userData.company_id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }

        console.log('Fetched projects for pipeline using fallback:', projects?.length || 0);

        if (!projects || projects.length === 0) {
          updateState({ 
            projects: [],
            stages: DEFAULT_PIPELINE_STAGES,
            loading: false, 
            isRefreshing: false,
            lastRefreshTime: new Date()
          });
          return;
        }

        // Transform project data for pipeline display with better logging
        const formattedProjects = projects.map(project => {
          const stageId = mapProjectStatusToPipelineStage(project.status);
          console.log(`Mapping project "${project.name}" with status "${project.status}" to stage "${stageId}"`);
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            stageId: stageId,
            company: project.companies?.name || 'Unbekanntes Unternehmen',
            company_id: project.company_id,
            updated_at: project.updated_at,
            status: project.status,
            progress: getProgressByStatus(project.status),
            hasUpdates: false
          };
        });
        
        updateState({ 
          projects: formattedProjects,
          stages: DEFAULT_PIPELINE_STAGES,
          loading: false,
          isRefreshing: false,
          lastRefreshTime: new Date()
        });
        
        cacheUtils.set('projects', formattedProjects);
      }
      
    } catch (error) {
      console.error('Error fetching projects for pipeline:', error);
      
      // Handle the RLS policy error gracefully
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Laden der Projektdaten';
      const isRlsError = errorMessage.includes('infinite recursion') || errorMessage.includes('policy');
      
      updateState({
        loading: false,
        isRefreshing: false,
        error: isRlsError 
          ? "Datenbank-Berechtigungsfehler: Bitte kontaktieren Sie den Support oder versuchen Sie es später erneut."
          : errorMessage,
        stages: DEFAULT_PIPELINE_STAGES
      });

      toast({
        title: "Laden fehlgeschlagen",
        description: "Projekte konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  }, [user, updateState]);

  // Fix the project stage update function to correctly map stages to statuses
  const updateProjectStage = useCallback(async (projectId: string, newStageId: string) => {
    const prevProjects = [...state.projects];
    
    // Optimistically update UI
    updateState({
      projects: prevProjects.map(project =>
        project.id === projectId ? { ...project, stageId: newStageId } : project
      )
    });
    
    try {
      // Convert pipeline stage ID to the corresponding project status
      const status = mapPipelineStageToProjectStatus(newStageId);
      console.log(`Updating project ${projectId} to stage ${newStageId} (status: ${status})`);
      
      // Update in database
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);
        
      if (error) throw error;
      
      // Update the local cache
      cacheUtils.set('projects', state.projects.map(project => 
        project.id === projectId ? { ...project, status, stageId: newStageId } : project
      ));
      
      toast({
        title: "Erfolg",
        description: "Projektstatus wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating project stage:', error);
      
      // Revert to previous state on error
      updateState({ projects: prevProjects });
      cacheUtils.clear('projects');
      
      toast({
        title: "Fehler",
        description: "Projektstatus konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  }, [state.projects, updateState]);

  // Filter projects based on search term and company
  const filteredProjects = useMemo(() => {
    return state.projects.filter(project => {
      const matchesSearch = !state.searchTerm || 
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCompany = !state.filterCompanyId || 
        project.company_id === state.filterCompanyId;
      return matchesSearch && matchesCompany;
    });
  }, [state.projects, state.searchTerm, state.filterCompanyId]);

  // Load data on initial render
  useEffect(() => {
    console.log('Initial pipeline data fetch...');
    fetchPipelineData();
  }, [fetchPipelineData]);

  return {
    ...state,
    projects: filteredProjects,
    setSearchTerm: (term: string) => updateState({ searchTerm: term }),
    setFilterCompanyId: (id: string | null) => updateState({ filterCompanyId: id }),
    updateProjectStage,
    refetch: () => {
      console.log('Forcing refresh of pipeline data...');
      cacheUtils.clear('projects');
      return fetchPipelineData(true);
    }
  };
};

// Helper functions for status mapping

// Map project status to pipeline stage ID - ensure all statuses are covered
function mapProjectStatusToPipelineStage(status: string): string {
  switch (status) {
    case 'planning':
      return 'project_start';
    case 'in_progress':
      return 'contact_made';
    case 'review':
      return 'final_review';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'project_start'; // Abgebrochene Projekte zeigen wir in der ersten Stufe
    default:
      console.warn(`Unknown status "${status}" - mapping to default stage "project_start"`);
      return 'project_start';
  }
}

// Map pipeline stage ID to project status - ensure all stages are covered
function mapPipelineStageToProjectStatus(stageId: string): string {
  switch (stageId) {
    case 'project_start':
      return 'planning';
    case 'candidates_found':
      return 'in_progress';
    case 'contact_made':
      return 'in_progress';
    case 'interviews_scheduled':
      return 'in_progress';
    case 'final_review':
      return 'review';
    case 'completed':
      return 'completed';
    default:
      console.warn(`Unknown stage "${stageId}" - mapping to default status "planning"`);
      return 'planning';
  }
}

// Calculate progress based on status
function getProgressByStatus(status: string): number {
  switch (status) {
    case 'planning': return 10;
    case 'in_progress': return 50;
    case 'review': return 80;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
}
