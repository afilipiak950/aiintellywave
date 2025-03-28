
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
    
    // Simplified query to avoid RLS issues
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, description, status, start_date, end_date')
      .eq('company_id', companyId);
      
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
