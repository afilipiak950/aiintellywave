
import { supabase } from '../integrations/supabase/client';
import { toast } from "../hooks/use-toast";
import { formatProjectsData } from '../utils/project-utils';

// Type for project
export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  company: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

// Fetch projects for a customer
export const fetchCustomerProjects = async (companyId: string): Promise<Project[]> => {
  if (!companyId) {
    console.error('No company ID provided to fetchCustomerProjects');
    return [];
  }
  
  try {
    console.log('Fetching customer projects for company:', companyId);
    
    // Fetch projects where either:
    // 1. The project belongs to the customer's company
    // 2. The project is assigned to the current user
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, description, status, start_date, end_date, assigned_to')
      .or(`company_id.eq.${companyId},assigned_to.eq.auth.uid()`);
      
    if (projectsError) {
      console.error('Error fetching customer projects:', projectsError);
      throw projectsError;
    }
    
    console.log('Customer projects received:', projectsData);
    
    if (projectsData) {
      return await formatProjectsData(projectsData, companyId, supabase);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching customer projects:', error);
    toast({
      title: "Error",
      description: "Failed to load projects. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Delete a project but retain its leads
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    // Update the project_id field to null for all leads associated with this project
    // This allows the leads to remain in the database after project deletion
    const { error: leadUpdateError } = await supabase
      .from('leads')
      .update({ project_id: null })
      .eq('project_id', projectId);
      
    if (leadUpdateError) {
      console.error('Error updating leads before project deletion:', leadUpdateError);
      throw leadUpdateError;
    }
    
    // Delete the project
    const { error: projectDeleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
      
    if (projectDeleteError) {
      console.error('Error deleting project:', projectDeleteError);
      throw projectDeleteError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteProject:', error);
    toast({
      title: "Error",
      description: "Failed to delete project. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Export the deleteProject function so it can be used in other components
export { deleteProject };
