
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Add assigned_to to the Project interface
interface Project {
  id: string;
  name: string;
  assigned_to?: string; // Make it optional since not all projects may have it
  company_id?: string;  // Add company_id
  status?: string;      // Add status
}

export const useManagerProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchProjects = async () => {
    // Prevent duplicate fetches
    if (projectsLoading && hasAttemptedFetch) return;
    
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      setHasAttemptedFetch(true);
      
      // First get the current user's company
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        setProjectsError("Nicht authentifiziert");
        throw new Error("Nicht authentifiziert");
      }
      
      // Get user's company association(s)
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id, is_primary_company')
        .eq('user_id', userData.user.id);
        
      if (companyError) {
        console.error('Error fetching user\'s company:', companyError);
        
        // Translate the policy error
        if (companyError.message?.includes('infinite recursion') || companyError.code === '42P17') {
          setProjectsError("Datenbankrichtlinienfehler: Bitte wenden Sie sich an den Support");
        } else {
          setProjectsError(companyError.message);
        }
        
        throw companyError;
      }
      
      if (!companyData || companyData.length === 0) {
        console.error('No company association found for user');
        setProjectsError("Keine Unternehmensverbindung gefunden");
        throw new Error("Keine Unternehmensverbindung gefunden");
      }
      
      // Prioritize primary company if available
      const primaryCompany = companyData.find(c => c.is_primary_company);
      const companyId = primaryCompany ? primaryCompany.company_id : companyData[0].company_id;
      
      console.log('Fetching projects for company:', companyId);
      
      // Fetch projects where either:
      // 1. The project belongs to the customer's company
      // 2. The project is assigned to the current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, company_id, assigned_to, status')
        .or(`company_id.eq.${companyId},assigned_to.eq.${userData.user.id}`);
        
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        
        // Translate common error messages
        if (projectsError.message?.includes('infinite recursion') || projectsError.code === '42P17') {
          setProjectsError("Datenbankrichtlinienfehler: Bitte verwenden Sie die Schaltfläche 'Verbindung reparieren'");
        } else {
          setProjectsError(projectsError.message);
        }
        
        throw projectsError;
      }
      
      console.log('Projects received:', projectsData);
      
      if (projectsData && projectsData.length > 0) {
        // Add all projects plus a special option for leads without projects
        const projectOptions = [
          ...projectsData.map(project => ({
            id: project.id,
            name: project.name,
            assigned_to: project.assigned_to,
            company_id: project.company_id,
            status: project.status
          }))
        ];
        
        setProjects(projectOptions);
      } else {
        console.warn('No projects found for company:', companyId);
        setProjectsError("Keine Projekte gefunden");
      }
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      
      // If no specific error was set above, set a generic one
      if (!projectsError) {
        setProjectsError(error instanceof Error ? error.message : "Unbekannter Fehler beim Abrufen von Projekten");
      }
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch projects once on initial load
    if (!hasAttemptedFetch) {
      fetchProjects();
    }
  }, [hasAttemptedFetch]);

  return {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen,
    fetchProjects,
    projectsError
  };
};
