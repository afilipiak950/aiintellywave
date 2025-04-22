
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../context/auth';
import { toast } from '../hooks/use-toast';
import { getProgressByStatus } from '../utils/project-utils';

export interface CustomerProject {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
}

export const useCustomerProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Beim ersten Laden versuchen, Projekte aus dem lokalen Storage zu laden
  useEffect(() => {
    try {
      const cachedProjects = localStorage.getItem('dashboard_projects');
      if (cachedProjects) {
        const parsedProjects = JSON.parse(cachedProjects);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          console.log('Loaded cached projects from localStorage:', parsedProjects.length);
          setProjects(parsedProjects);
        }
      }
    } catch (err) {
      console.warn('Failed to load cached projects:', err);
    }
  }, []);

  // Speichern der Projekte im lokalen Storage wenn sie sich ändern
  useEffect(() => {
    if (projects.length > 0) {
      try {
        localStorage.setItem('dashboard_projects', JSON.stringify(projects));
        console.log('Saved projects to localStorage:', projects.length);
      } catch (err) {
        console.warn('Failed to cache projects:', err);
      }
    }
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const now = Date.now();
      // Verhindern von zu häufigen Anfragen (Rate Limiting)
      if (now - lastFetchTime < 2000 && retryCount > 0) {
        console.log('Throttling fetch requests, trying again in 2 seconds...');
        setTimeout(() => setRetryCount(prev => prev + 1), 2000);
        return;
      }
      
      setLastFetchTime(now);
      setLoading(true);
      setError(null);

      console.log('Fetching customer projects for user:', user.id);
      
      // Multi-strategie Ansatz: Versuche alle möglichen Wege, um Projekte zu laden
      let allProjects: any[] = [];
      
      // 1. Versuche, die Projekte direkt zu laden, die dem Benutzer zugewiesen sind
      try {
        const { data: directProjects, error: directError } = await supabase
          .from('projects')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (!directError && directProjects && directProjects.length > 0) {
          console.log('Found directly assigned projects:', directProjects.length);
          allProjects = [...allProjects, ...directProjects];
        }
      } catch (directError) {
        console.warn('Error fetching direct projects:', directError);
      }
      
      // 2. Versuche, die company_id für den aktuellen Benutzer zu bekommen
      try {
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (companyUserError) {
          // Prüfen auf unendliche Rekursion in der RLS-Richtlinie
          if (companyUserError.message.includes('infinite recursion')) {
            console.warn("RLS policy error detected, continuing with other methods");
          } else {
            console.error('Error fetching company ID:', companyUserError);
          }
        } else {
          const companyId = companyUserData?.company_id;
          
          if (companyId) {
            console.log('Found company ID:', companyId);
            
            // 3. Lade Projekte für das Unternehmen des Benutzers
            const { data: companyProjects, error: projectsError } = await supabase
              .from('projects')
              .select('*')
              .eq('company_id', companyId);
              
            if (!projectsError && companyProjects && companyProjects.length > 0) {
              console.log('Found company projects:', companyProjects.length);
              allProjects = [...allProjects, ...companyProjects];
            }
          }
        }
      } catch (error) {
        console.warn('Error in company fetch, continuing with other methods:', error);
      }
      
      // Entferne Duplikate (falls vorhanden)
      const uniqueProjects = Array.from(
        new Map(allProjects.map(item => [item.id, item])).values()
      );
      
      if (uniqueProjects.length > 0) {
        const formattedProjects = uniqueProjects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          progress: getProgressByStatus(project.status)
        }));
        
        console.log('Total projects found after deduplication:', formattedProjects.length);
        console.log('Project names:', formattedProjects.map(p => p.name));
        
        setProjects(formattedProjects);
      } else if (projects.length === 0) {
        // Nur wenn wir keine aktuellen Projekte haben, setzen wir ein leeres Array
        console.log('No projects found from any source');
        setProjects([]);
      }
    } catch (error: any) {
      console.error('Error in useCustomerProjects:', error);
      
      // Fehlermeldung setzen, aber vorhandene Projekte nicht löschen
      setError(error.message || 'Failed to load projects');
      
      // Nur einen Toast anzeigen, wenn keine zwischengespeicherten Projekte vorhanden sind
      if (projects.length === 0) {
        toast({
          title: "Fehler",
          description: "Projekte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount, lastFetchTime, projects.length]);

  const retryFetchProjects = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, error, fetchProjects, retryFetchProjects };
};
