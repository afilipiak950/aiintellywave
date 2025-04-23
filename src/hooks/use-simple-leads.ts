
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

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let leadsData: Lead[];
      
      if (selectedProject === 'all') {
        leadsData = await fetchLeads();
      } else {
        leadsData = await fetchProjectLeads(selectedProject);
      }
      
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
  }, [selectedProject]);

  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await fetchProjects();
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

  // Load projects and leads on initial render
  useEffect(() => {
    loadProjects();
    loadLeads();
  }, [loadProjects, loadLeads]);

  // Reload leads when selected project changes
  useEffect(() => {
    loadLeads();
  }, [selectedProject, loadLeads]);

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
