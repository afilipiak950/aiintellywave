
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
    return "Zugriffsrechte fehlen. Bitte überprüfen Sie Ihre Berechtigungen oder kontaktieren Sie den Support.";
  }
  
  if (error.message.includes("Failed to fetch")) {
    return "Netzwerkfehler beim Laden der Leads. Überprüfen Sie bitte Ihre Internetverbindung.";
  }
  
  // Return the original error message if we don't have a specific handler
  return error.message;
};

/**
 * Direct method to get project leads bypassing hooks
 * This is a simplified version to avoid complexity
 */
export const getProjectLeadsDirectly = async (projectId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id, name, company, email, phone, position, status, 
        notes, last_contact, created_at, updated_at, 
        score, tags, project_id
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching leads directly:', error);
      throw error;
    }
    
    return data.map(lead => ({
      ...lead,
      project_name: 'Projekt',
      website: null
    })) as Lead[];
  } catch (error) {
    console.error(`Failed to fetch leads for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get all projects for the current user directly from the database
 * Simplified version
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user projects directly:', error);
      throw error;
    }
    
    return data as Project[];
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    throw error;
  }
};

/**
 * Get diagnostic information about the current user session and permissions
 * Simplified version
 */
export const getDiagnosticInfo = async () => {
  try {
    const diagnostics: Record<string, any> = {};
    
    // Check authentication
    const { data: authData } = await supabase.auth.getUser();
    diagnostics.isAuthenticated = !!authData?.user;
    diagnostics.userId = authData?.user?.id;
    diagnostics.userEmail = authData?.user?.email;
    
    // Try getting projects directly
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .limit(5);
      
      diagnostics.projectsFound = projectsData?.length || 0;
      diagnostics.directProjectAccess = !projectsError;
      
      if (projectsError) {
        diagnostics.projectsError = projectsError.message;
      }
      
      if (projectsData && projectsData.length > 0) {
        // Try to get leads from first project
        try {
          const { data: leadsData, error: leadsError } = await supabase
            .from('leads')
            .select('id')
            .eq('project_id', projectsData[0].id)
            .limit(1);
          
          diagnostics.canAccessLeads = !leadsError;
          diagnostics.leadsCount = leadsData?.length || 0;
          diagnostics.directLeadAccess = !leadsError;
          
          if (leadsError) {
            diagnostics.leadsError = leadsError.message;
          }
        } catch (error) {
          diagnostics.leadsAccessError = error instanceof Error ? error.message : String(error);
        }
      }
    } catch (error) {
      diagnostics.projectsAccessError = error instanceof Error ? error.message : String(error);
    }
    
    // Try to get user role
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData?.user?.id)
        .maybeSingle();
        
      diagnostics.userRole = roleData?.role || 'unbekannt';
    } catch (error) {
      diagnostics.userRoleError = error instanceof Error ? error.message : String(error);
    }
    
    return diagnostics;
  } catch (error) {
    console.error('Error getting diagnostic info:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
