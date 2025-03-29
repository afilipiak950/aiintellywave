
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Add assigned_to to the Project interface
interface Project {
  id: string;
  name: string;
  assigned_to?: string; // Make it optional since not all projects may have it
}

export const useManagerProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, company_id, assigned_to')
          .order('name');
        
        if (error) {
          console.error('Error fetching projects:', error);
          throw error;
        }
        
        if (data) {
          // Add all projects plus a special option for leads without projects
          const projectOptions = [
            ...data.map(project => ({
              id: project.id,
              name: project.name,
              assigned_to: project.assigned_to
            })),
            {
              id: 'unassigned',
              name: 'Leads without Project'
            }
          ];
          
          setProjects(projectOptions);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  return {
    projects,
    projectsLoading,
    createDialogOpen,
    setCreateDialogOpen
  };
};
