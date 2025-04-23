
import { useState, useEffect, useCallback } from 'react';
import { fetchLeads, fetchProjectLeads, fetchProjects } from '@/services/leads/simple-lead-service';
import { fetchLeadsWithFallback, migrateExcelToLeads } from '@/services/leads/utils/fallback-lead-service';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Fetch user's projects first
  const loadProjects = useCallback(async () => {
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!userData?.user?.id) {
        throw new Error('Not authenticated');
      }
      
      // Get user's assigned projects
      const { data: userProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('assigned_to', userData.user.id);

      if (projectsError) {
        console.error('Error loading assigned projects:', projectsError);
        
        // Fallback to regular projects fetch
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        return;
      }
      
      console.log(`Found ${userProjects?.length || 0} projects assigned to user`);
      
      // If user has assigned projects, use those
      if (userProjects && userProjects.length > 0) {
        setProjects(userProjects);
      } else {
        // Fallback to company projects if no assigned projects
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userData.user.id)
          .single();
          
        if (companyUser?.company_id) {
          const { data: companyProjects } = await supabase
            .from('projects')
            .select('id, name')
            .eq('company_id', companyUser.company_id);
            
          if (companyProjects && companyProjects.length > 0) {
            setProjects(companyProjects);
            return;
          }
        }
        
        // Final fallback to all projects if no company or assigned projects found
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      }
    } catch (err) {
      console.error('Error in loadProjects:', err);
      
      // Direct DB-Abfrage als Fallback
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
          // If 'all' is selected, load leads from all user's projects
          if (projects.length > 0) {
            // Fetch leads from each project
            const allProjectLeads: Lead[] = [];
            
            for (const project of projects) {
              const projectLeads = await fetchProjectLeads(project.id);
              allProjectLeads.push(...projectLeads);
            }
            
            leadsData = allProjectLeads;
          } else {
            // Fallback to all leads if no projects found
            leadsData = await fetchLeads();
          }
        } else {
          // Load leads for specific project
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
          } else if (projects.length > 0) {
            // When 'all' is selected but we're using fallback, 
            // filter leads to only show those from user's projects
            const projectIds = projects.map(project => project.id);
            leadsData = leadsData.filter(lead => 
              lead.project_id && projectIds.includes(lead.project_id)
            );
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
  }, [selectedProject, projects]);

  // Beim ersten Render Projekte laden
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Leads laden, wenn sich das ausgewählte Projekt ändert oder Projekte geladen wurden
  useEffect(() => {
    if (projects.length > 0 || retryCount > 0) {
      loadLeads();
    }
  }, [selectedProject, projects, loadLeads, retryCount]);

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
