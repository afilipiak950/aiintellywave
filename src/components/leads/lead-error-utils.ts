
import { Lead } from "@/types/lead";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a user-friendly error message from various error types
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return "Unbekannter Fehler beim Laden der Leads";
  
  // Check for specific error types
  if (error.message.includes("permission denied") || 
      error.message.includes("infinite recursion")) {
    return "Zugriffsrechte fehlen. Bitte versuchen Sie es später erneut oder kontaktieren Sie den Support.";
  }
  
  if (error.message.includes("Failed to fetch")) {
    return "Netzwerkfehler beim Laden der Leads. Überprüfen Sie bitte Ihre Internetverbindung.";
  }
  
  // Return the original error message if we don't have a specific handler
  return error.message;
};

/**
 * Direct method to get user's projects - simplified
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    // Get the user's ID first
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("Nicht authentifiziert");
    }
    
    // Try to get projects directly
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, company_id, status')
      .order('name');
      
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    return data as Project[];
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    return [];
  }
};

/**
 * Direct method to get project leads bypassing hooks
 */
export const getProjectLeads = async (projectId?: string): Promise<Lead[]> => {
  try {
    let query = supabase
      .from('leads')
      .select(`
        id, name, company, email, phone, position, status, 
        notes, last_contact, created_at, updated_at, 
        score, tags, project_id
      `)
      .order('created_at', { ascending: false });
      
    // If a project ID is provided, filter by it
    if (projectId && projectId !== 'all') {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    return data.map(lead => ({
      ...lead,
      project_name: 'Projekt',
      website: null
    })) as Lead[];
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw error;
  }
};

/**
 * Get diagnostic information about the current user session and permissions
 */
export const getDiagnosticInfo = async () => {
  try {
    // Check authentication
    const { data: authData } = await supabase.auth.getUser();
    
    return {
      isAuthenticated: !!authData?.user,
      userId: authData?.user?.id,
      userEmail: authData?.user?.email
    };
  } catch (error) {
    console.error('Error getting diagnostic info:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
