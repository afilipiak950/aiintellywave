
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { getProgressByStatus } from '../utils/project-status';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  assigned_to: string | null;
  assignee_name: string | null;
}

export const fetchManagerProjects = async (companyId: string | undefined): Promise<Project[]> => {
  if (!companyId) return [];
  
  try {
    console.log('Fetching manager projects for company:', companyId);
    
    // Simplified query to avoid RLS issues
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id, 
        name, 
        description, 
        status, 
        start_date, 
        end_date,
        assigned_to,
        company_users!projects_assigned_to_fkey (
          email,
          full_name
        )
      `)
      .eq('company_id', companyId);
      
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }
    
    console.log('Manager projects received:', projectsData);
    
    if (projectsData) {
      // Get company name in a separate query
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .maybeSingle();
        
      const companyName = companyError ? 'Unknown Company' : companyData?.name || 'Unknown Company';
      
      return projectsData.map(project => {
        const assigneeData = project.company_users || null;
        
        return {
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status,
          company: companyName,
          start_date: project.start_date,
          end_date: project.end_date,
          progress: getProgressByStatus(project.status),
          assigned_to: project.assigned_to,
          assignee_name: assigneeData?.full_name || null,
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching manager projects:', error);
    toast({
      title: "Error",
      description: "Failed to load projects. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};
