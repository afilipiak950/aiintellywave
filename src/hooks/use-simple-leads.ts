
import { useState, useEffect, useCallback } from 'react';
import { fetchLeads, fetchProjectLeads, fetchProjects } from '@/services/leads/simple-lead-service';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const useSimpleLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<{ id: string, name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Simplified lead loading function
  const loadLeads = useCallback(async () => {
    if (projects.length === 0) return; // Don't try to load leads if we don't have projects yet
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching leads, selected project:', selectedProject);
      
      let leadsData: Lead[];
      
      if (selectedProject === 'all') {
        leadsData = await fetchLeads();
      } else {
        leadsData = await fetchProjectLeads(selectedProject);
      }
      
      console.log('Fetched leads:', leadsData.length);
      setLeads(leadsData);
    } catch (err) {
      console.error('Error loading leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to load leads'));
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Die Leads konnten nicht geladen werden."
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject, projects.length]);

  // Load all projects first
  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await fetchProjects();
      console.log('Fetched projects:', projectsData.length);
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Die Projekte konnten nicht geladen werden."
      });
    }
  }, []);

  // Load projects on initial render
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load leads whenever projects are loaded or selected project changes
  useEffect(() => {
    if (projects.length > 0) {
      loadLeads();
    }
  }, [projects, selectedProject, loadLeads]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadLeads();
  };

  return {
    leads,
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    handleRetry,
    retryCount
  };
};
