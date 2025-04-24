
import { useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/auth';
import { toast } from '../use-toast';
import { cacheUtils } from '../../utils/cache-utils';
import { PipelineHookReturn } from './types';
import { usePipelineState } from './use-pipeline-state';
import { supabase } from '../../integrations/supabase/client';
import { DEFAULT_PIPELINE_STAGES } from '../../types/pipeline';

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
      console.log('Fetching projects for pipeline...');
      
      // Verbesserte Abfrage, die auch den Unternehmensnamen einbezieht
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*, companies(name)')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Fetched projects:', projects?.length || 0);

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

      // Transformiere die Projektdaten für die Pipeline-Anzeige
      const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        // Mapping von Projektstatus zu Pipeline-Stufen
        stageId: mapProjectStatusToPipelineStage(project.status),
        company: project.companies?.name || 'Unbekanntes Unternehmen',
        company_id: project.company_id,
        updated_at: project.updated_at,
        status: project.status,
        progress: getProgressByStatus(project.status),
        hasUpdates: false
      }));
      
      updateState({ 
        projects: formattedProjects,
        stages: DEFAULT_PIPELINE_STAGES,
        loading: false,
        isRefreshing: false,
        lastRefreshTime: new Date()
      });
      
      cacheUtils.set('projects', formattedProjects);
      console.log('Pipeline data updated with', formattedProjects.length, 'projects');
    } catch (error) {
      console.error('Error fetching projects:', error);
      updateState({
        loading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Fehler beim Laden der Projektdaten',
        stages: DEFAULT_PIPELINE_STAGES
      });

      toast({
        title: "Synchronisierungsfehler",
        description: "Projekte konnten nicht synchronisiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  }, [user, updateState]);

  const updateProjectStage = useCallback(async (projectId: string, newStageId: string) => {
    const prevProjects = [...state.projects];
    
    // Optimistisches Update der UI
    updateState({
      projects: prevProjects.map(project =>
        project.id === projectId ? { ...project, stageId: newStageId } : project
      )
    });
    
    try {
      // Konvertiere Pipeline-Stufen-ID zurück in den entsprechenden Projektstatus
      const status = mapPipelineStageToProjectStatus(newStageId);
      
      // Update in der Datenbank
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);
        
      if (error) throw error;
      
      cacheUtils.set('projects', state.projects);
      
      toast({
        title: "Erfolg",
        description: "Projektstatus wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating project stage:', error);
      
      // Zurück zum vorherigen Zustand bei Fehler
      updateState({ projects: prevProjects });
      cacheUtils.clear('projects');
      
      toast({
        title: "Fehler",
        description: "Projektstatus konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  }, [state.projects, updateState]);

  // Gefilterte Projekte basierend auf Suchbegriff und ausgewähltem Unternehmen
  const filteredProjects = useMemo(() => {
    return state.projects.filter(project => {
      const matchesSearch = !state.searchTerm || 
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesCompany = !state.filterCompanyId || 
        project.company_id === state.filterCompanyId;
      return matchesSearch && matchesCompany;
    });
  }, [state.projects, state.searchTerm, state.filterCompanyId]);

  // Lade Daten beim ersten Rendern
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

// Hilfsfunktionen für Status-Mapping

// Diese Funktion ordnet den Projektstatus einer Pipeline-Stufen-ID zu
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
      return 'project_start';
  }
}

// Diese Funktion ordnet eine Pipeline-Stufen-ID einem Projektstatus zu
function mapPipelineStageToProjectStatus(stageId: string): string {
  switch (stageId) {
    case 'project_start':
      return 'planning';
    case 'candidates_found':
    case 'contact_made':
    case 'interviews_scheduled':
      return 'in_progress';
    case 'final_review':
      return 'review';
    case 'completed':
      return 'completed';
    default:
      return 'planning';
  }
}

// Berechnung des Fortschritts basierend auf Status
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
