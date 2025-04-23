
import { Lead } from "@/types/lead";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a user-friendly error message from various error types
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return "Unbekannter Fehler beim Laden der Leads";
  
  // Check for specific error types
  if (error.message.includes("permission denied for table")) {
    return "Zugriffsrechte fehlen. Bitte überprüfen Sie Ihre Berechtigungen oder kontaktieren Sie den Support.";
  }
  
  if (error.message.includes("Failed to fetch")) {
    return "Netzwerkfehler beim Laden der Leads. Überprüfen Sie bitte Ihre Internetverbindung.";
  }
  
  if (error.message.includes("infinite recursion")) {
    return "Datenbankrichtlinienfehler. Ein Administrator wurde benachrichtigt.";
  }
  
  // Return the original error message if we don't have a specific handler
  return error.message;
};

/**
 * Direct method to get project leads bypassing hooks
 */
export const getProjectLeadsDirectly = async (projectId: string): Promise<Lead[]> => {
  console.log(`Direct lead fetch for project: ${projectId}`);
  
  try {
    // More reliable approach with fewer joins
    const { data: leadsData, error } = await supabase
      .from('leads')
      .select(`
        *,
        projects:project_id (name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching leads directly:', error);
      throw error;
    }
    
    // Process leads to include project_name
    const leads = (leadsData || []).map(lead => {
      return {
        ...lead,
        project_name: lead.projects?.name || 'Unbekannt',
        // Ensure we have the right format for extra_data
        extra_data: lead.extra_data ? 
          (typeof lead.extra_data === 'string' ? 
            JSON.parse(lead.extra_data) : lead.extra_data) : 
          null,
        website: null // Add required website property
      } as Lead;
    });
    
    return leads;
  } catch (error) {
    console.error(`Failed to fetch leads for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get all projects for the current user directly from the database
 */
export const getUserProjects = async (): Promise<Project[]> => {
  console.log('Fetching user projects directly');
  
  try {
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user projects directly:', error);
      throw error;
    }
    
    return projectsData as Project[];
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    throw error;
  }
};

/**
 * Get diagnostic information about the current user session and permissions
 */
export const getDiagnosticInfo = async () => {
  try {
    const diagnostics: Record<string, any> = {};
    
    // Check authentication
    const { data: authData } = await supabase.auth.getUser();
    diagnostics.isAuthenticated = !!authData?.user;
    diagnostics.userId = authData?.user?.id;
    diagnostics.userEmail = authData?.user?.email;
    
    // Try getting all projects directly
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .limit(10);
      
      diagnostics.projectsFound = projectsData?.length || 0;
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
    
    return diagnostics;
  } catch (error) {
    console.error('Error getting diagnostic info:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
