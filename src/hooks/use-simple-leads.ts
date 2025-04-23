
import { useState, useEffect, useCallback } from 'react';
import { fetchLeads, fetchProjectLeads, fetchProjects } from '@/services/leads/simple-lead-service';
import { fetchLeadsWithFallback, migrateExcelToLeads } from '@/services/leads/utils/fallback-lead-service';
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
  const [usedExcelFallback, setUsedExcelFallback] = useState(false);
  const [migratedLeadCount, setMigratedLeadCount] = useState<number | null>(null);

  // Projekte zuerst laden
  const loadProjects = useCallback(async () => {
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Fehler beim Laden der Projekte:', err);
      
      // Direkte DB-Abfrage als Fallback
      try {
        const { data } = await fetch('/api/projects').then(res => res.json());
        if (data && Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch (fallbackErr) {
        console.error('Fallback für Projekte fehlgeschlagen:', fallbackErr);
        toast({
          variant: "destructive",
          title: "Fehler beim Laden",
          description: "Die Projekte konnten nicht geladen werden."
        });
      }
    }
  }, []);

  // Lead-Migration in die Datenbank
  const runMigration = useCallback(async () => {
    try {
      setIsLoading(true);
      const migratedCount = await migrateExcelToLeads();
      setMigratedLeadCount(migratedCount);
      
      if (migratedCount > 0) {
        toast({
          title: "Migration abgeschlossen",
          description: `Es wurden ${migratedCount} Leads aus Excel-Daten migriert.`
        });
        
        // Leads nach erfolgreicher Migration erneut laden
        await loadLeads();
      }
    } catch (err) {
      console.error('Fehler bei der Migration:', err);
      toast({
        variant: "destructive",
        title: "Migrationsfehler",
        description: "Die Excel-Daten konnten nicht migriert werden."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Leads erst laden, wenn Projekte verfügbar sind
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);
    setUsedExcelFallback(false);
    
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
        setUsedExcelFallback(false);
      } catch (primaryError) {
        console.warn('Primärer Ladepfad fehlgeschlagen, verwende Fallback:', primaryError);
        
        // Bei RLS-Fehlern Fallback verwenden
        try {
          leadsData = await fetchLeadsWithFallback();
          
          // Prüfen, ob es sich um Excel-Leads handelt (anhand von Tags)
          const containsExcelLeads = leadsData.some(lead => 
            lead.tags && lead.tags.includes('excel-import')
          );
          
          setUsedFallback(true);
          setUsedExcelFallback(containsExcelLeads);
          
          // Wenn ein Projekt ausgewählt ist, nach dem Laden filtern
          if (selectedProject !== 'all') {
            leadsData = leadsData.filter(lead => lead.project_id === selectedProject);
          }
        } catch (fallbackError) {
          console.error('Fallback-Mechanismus fehlgeschlagen:', fallbackError);
          throw fallbackError; // Weitergeben für übergeordnete Fehlerbehandlung
        }
      }
      
      // Nach erfolgreichem Laden die Leads setzen
      if (leadsData && Array.isArray(leadsData)) {
        console.log(`${leadsData.length} Leads geladen`);
        setLeads(leadsData);
      } else {
        console.warn('Unerwartetes Format der geladenen Leads:', leadsData);
        setLeads([]);
      }
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
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    loadLeads();
  }, [loadLeads]);

  return {
    leads,
    projects,
    selectedProject,
    setSelectedProject,
    isLoading,
    error,
    handleRetry,
    retryCount,
    usedFallback,
    usedExcelFallback,
    runMigration,
    migratedLeadCount
  };
};
