
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/auth';
import { PipelineProject, DEFAULT_PIPELINE_STAGES, PipelineStage } from '../types/pipeline';
import { toast } from './use-toast';
import { supabase } from '../integrations/supabase/client';

export const usePipeline = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<PipelineProject[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);

  const fetchPipelineData = useCallback(async () => {
    setLoading(true);
    try {
      // If no user, return early
      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }
      
      console.log('[usePipeline] Fetching pipeline data for user:', user.id);
      
      // Multi-strategie Ansatz: Versuche alle möglichen Wege, um Projekte zu laden
      let allProjects: any[] = [];
      let companyName = 'Unbekannte Firma';
      let companyId = null;
      
      // 1. Versuche, direkte Projekte zu laden
      try {
        const { data: assignedProjects, error: assignedProjectsError } = await supabase
          .from('projects')
          .select('id, name, description, status, start_date, end_date, updated_at')
          .eq('assigned_to', user.id);
          
        if (!assignedProjectsError && assignedProjects && assignedProjects.length > 0) {
          console.log('[usePipeline] Found directly assigned projects:', assignedProjects.length);
          allProjects = [...assignedProjects];
        }
      } catch (directError) {
        console.warn('[usePipeline] Error fetching direct projects:', directError);
      }
      
      // 2. Versuche, über die Firmen-ID Projekte zu laden
      try {
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (!companyUserError && companyUserData?.company_id) {
          companyId = companyUserData.company_id;
          console.log('[usePipeline] Found company ID:', companyId);
          
          // Hole Firmenname
          const { data: companyData } = await supabase
            .from('companies')
            .select('name')
            .eq('id', companyId)
            .maybeSingle();
            
          if (companyData) {
            companyName = companyData.name;
          }
          
          // Hole Firmenprojekte
          const { data: companyProjects, error: projectsError } = await supabase
            .from('projects')
            .select('id, name, description, status, start_date, end_date, updated_at')
            .eq('company_id', companyId);
            
          if (!projectsError && companyProjects && companyProjects.length > 0) {
            console.log('[usePipeline] Found company projects:', companyProjects.length);
            
            // Füge alle neuen Projekte hinzu (ohne Duplikate)
            const existingIds = new Set(allProjects.map(p => p.id));
            const newProjects = companyProjects.filter(p => !existingIds.has(p.id));
            allProjects = [...allProjects, ...newProjects];
          }
        }
      } catch (companyError) {
        console.warn('[usePipeline] Error in company lookup:', companyError);
      }
      
      if (allProjects.length > 0) {
        console.log('[usePipeline] Total projects found:', allProjects.length);
        console.log('[usePipeline] Project names:', allProjects.map((p: any) => p.name));
        
        const pipelineProjects = allProjects.map((project, index) => {
          let stageId;
          if (project.status === 'planning') stageId = 'project_start';
          else if (project.status === 'in_progress') stageId = ['candidates_found', 'contact_made', 'interviews_scheduled'][index % 3];
          else if (project.status === 'review') stageId = 'final_review';
          else if (project.status === 'completed') stageId = 'completed';
          else stageId = DEFAULT_PIPELINE_STAGES[index % DEFAULT_PIPELINE_STAGES.length].id;
          
          return {
            id: project.id,
            name: project.name,
            description: project.description || '',
            stageId,
            company: companyName,
            company_id: companyId || 'own',
            status: project.status,
            updated_at: project.updated_at,
            progress: getProgressByStatus(project.status),
            hasUpdates: isRecentlyUpdated(project.updated_at)
          };
        });
        
        setProjects(pipelineProjects);
      } else {
        console.log('[usePipeline] No projects found from any source');
        setProjects([]);
      }
    } catch (error: any) {
      console.error('[usePipeline] Error fetching pipeline data:', error);
      toast({
        title: "Fehler",
        description: "Pipeline-Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, retryCounter]);

  const updateProjectStage = async (projectId: string, newStageId: string) => {
    // Find the project and update its stage
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, stageId: newStageId } : project
    );
    
    // Optimistically update UI
    setProjects(updatedProjects);
    
    try {
      // In a real app you would update the database here
      // await supabase.from('projects').update({ stage_id: newStageId }).eq('id', projectId);
      
      toast({
        title: "Erfolg",
        description: "Projekt in neue Phase verschoben.",
      });
    } catch (error) {
      console.error('[usePipeline] Error updating project stage:', error);
      toast({
        title: "Fehler",
        description: "Projektphase konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
      
      // Revert changes on error
      setProjects(projects);
    }
  };
  
  // Retry fetching data
  const retryFetch = useCallback(() => {
    setRetryCounter(prev => prev + 1);
  }, []);
  
  // Filter projects based on search term and company filter
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.company.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCompany = !filterCompanyId || project.company_id === filterCompanyId;
    
    return matchesSearch && matchesCompany;
  });

  // Check if a project was recently updated (within the last 24 hours)
  const isRecentlyUpdated = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]); 

  return {
    projects: filteredProjects,
    stages,
    loading,
    searchTerm,
    setSearchTerm,
    filterCompanyId,
    setFilterCompanyId,
    updateProjectStage,
    fetchPipelineData,
    retryFetch
  };
};

// Helper to calculate progress based on status
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
