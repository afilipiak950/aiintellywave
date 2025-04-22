
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
  
  // Neuer State, um Projekte im lokalen Storage zu speichern
  useEffect(() => {
    // Beim ersten Laden versuchen, Projekte aus dem lokalen Storage zu laden
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
      
      // Zuerst versuchen, direkt über projects Tabelle zu laden, ohne company_id
      try {
        const { data: directProjects, error: directError } = await supabase
          .from('projects')
          .select('*')
          .eq('assigned_to', user.id);
          
        if (!directError && directProjects && directProjects.length > 0) {
          console.log('Found directly assigned projects:', directProjects.length);
          const formattedProjects = directProjects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: project.status,
            progress: getProgressByStatus(project.status)
          }));
          
          setProjects(formattedProjects);
          setLoading(false);
          return; // Früher zurückkehren, wenn wir direkt zugeordnete Projekte finden
        }
      } catch (directError) {
        console.warn('Error fetching direct projects, trying company ID method instead:', directError);
        // Continue with company ID method
      }
      
      // Dann, versuchen wir die company_id für den aktuellen Benutzer zu bekommen
      try {
        const { data: companyUserData, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (companyUserError) {
          // Prüfen auf unendliche Rekursion in der RLS-Richtlinie
          if (companyUserError.message.includes('infinite recursion')) {
            throw new Error("Failed to fetch company ID: infinite recursion detected in policy for relation 'user_roles'");
          }
          
          console.error('Error fetching company ID:', companyUserError);
          throw new Error(`Failed to fetch company ID: ${companyUserError.message}`);
        }
        
        const companyId = companyUserData?.company_id;
        
        if (!companyId) {
          console.log('No company ID found for user, checking assigned projects');
          
          // Wenn keine company_id, versuchen wir Projekte zu finden, die direkt dem Benutzer zugewiesen sind
          const { data: assignedProjects, error: assignedProjectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('assigned_to', user.id);
            
          if (assignedProjectsError) {
            console.error('Error fetching assigned projects:', assignedProjectsError);
            throw new Error(`Failed to fetch assigned projects: ${assignedProjectsError.message}`);
          }
          
          if (assignedProjects && assignedProjects.length > 0) {
            const formattedProjects = assignedProjects.map(project => ({
              id: project.id,
              name: project.name,
              description: project.description || '',
              status: project.status,
              progress: getProgressByStatus(project.status)
            }));
            
            console.log('Found assigned projects:', formattedProjects.length);
            setProjects(formattedProjects);
          } else {
            console.log('No assigned projects found');
            // Wichtig: Wir setzen die Projekte nicht auf leeres Array, wenn wir keine finden
            // Das verhindert, dass die zuvor geladenen Projekte verschwinden
            if (projects.length === 0) {
              setProjects([]);
            }
          }
        } else {
          console.log('Found company ID:', companyId);
          
          // Projekte für das Unternehmen abrufen
          const { data: companyProjects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('company_id', companyId);
            
          if (projectsError) {
            console.error('Error fetching company projects:', projectsError);
            throw new Error(`Failed to fetch company projects: ${projectsError.message}`);
          }
          
          if (companyProjects && companyProjects.length > 0) {
            const formattedProjects = companyProjects.map(project => ({
              id: project.id,
              name: project.name,
              description: project.description || '',
              status: project.status,
              progress: getProgressByStatus(project.status)
            }));
            
            console.log('Found company projects:', formattedProjects.length);
            setProjects(formattedProjects);
          } else {
            console.log('No company projects found');
            // Wichtig: Wir setzen die Projekte nicht auf leeres Array, wenn wir keine finden
            if (projects.length === 0) {
              setProjects([]);
            }
          }
        }
      } catch (error: any) {
        console.error('Error in useCustomerProjects:', error);
        
        // Spezielle Behandlung für RLS-Richtlinienfehler
        if (error.message.includes('infinite recursion')) {
          setError('Failed to fetch company ID: infinite recursion detected in policy for relation "user_roles"');
        } else {
          setError(error.message || 'Failed to load projects');
        }
        
        // Nur einen Toast anzeigen, wenn keine zwischengespeicherten Projekte vorhanden sind
        if (projects.length === 0) {
          toast({
            title: "Fehler",
            description: "Projekte konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
            variant: "destructive"
          });
        }
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
