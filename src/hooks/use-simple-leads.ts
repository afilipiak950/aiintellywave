
import { useState, useEffect, useCallback } from 'react';
import { fetchLeads, fetchProjectLeads, fetchProjects } from '@/services/leads/simple-lead-service';
import { fetchLeadsWithFallback } from '@/services/leads/utils/fallback-lead-service';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const useSimpleLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<{ id: string, name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usedFallback, setUsedFallback] = useState(false);

  // Projekte zuerst laden
  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Fehler beim Laden der Projekte:', err);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Die Projekte konnten nicht geladen werden."
      });
    }
  }, []);

  // Leads erst laden, wenn Projekte verfügbar sind
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let leadsData: Lead[] = [];
      
      try {
        // Zuerst regulären Ladepfad versuchen
        if (selectedProject === 'all') {
          leadsData = await fetchLeads();
        } else {
          leadsData = await fetchProjectLeads(selectedProject);
        }
        setUsedFallback(false);
      } catch (primaryError) {
        console.warn('Primärer Ladepfad fehlgeschlagen, verwende Fallback:', primaryError);
        
        // Bei RLS-Fehlern Fallback verwenden
        if (primaryError.message?.includes('infinite recursion') || 
            primaryError.message?.includes('policy for relation')) {
          leadsData = await fetchLeadsWithFallback();
          setUsedFallback(true);
          
          // Wenn ein Projekt ausgewählt ist, nach dem Laden filtern
          if (selectedProject !== 'all') {
            leadsData = leadsData.filter(lead => lead.project_id === selectedProject);
          }
        } else {
          // Wenn es kein RLS-Problem ist, Fehler weiterwerfen
          throw primaryError;
        }
      }
      
      setLeads(leadsData);
    } catch (err) {
      console.error('Fehler beim Laden der Leads:', err);
      setError(err instanceof Error ? err : new Error('Fehler beim Laden der Leads'));
      toast({
        variant: "destructive",
        title: "Fehler beim Laden",
        description: "Die Leads konnten nicht geladen werden."
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedProject]);

  // Beim ersten Render Projekte laden
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Leads laden, wenn sich das ausgewählte Projekt ändert
  useEffect(() => {
    loadLeads();
  }, [selectedProject, loadLeads]);

  // Funktion zum manuellen Neuladen der Daten
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
    retryCount,
    usedFallback
  };
};
