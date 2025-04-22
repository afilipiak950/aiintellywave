
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to get a more user-friendly error message
 * based on the type of error encountered
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return "Unknown error occurred";
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('infinite recursion')) {
    return "Database security policy error. The system is using alternate methods to load your leads.";
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return "Network connectivity issue. Please check your internet connection.";
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('not authorized')) {
    return "Permission error. You may not have access to these leads.";
  }
  
  return error.message;
};

/**
 * Get diagnostic information about the current user's permissions
 * Useful for debugging access issues
 */
export const getDiagnosticInfo = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { error: "Not authenticated" };
    
    const userId = userData.user.id;
    const email = userData.user.email;
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    const { data: companyUsers } = await supabase
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', userId);
      
    return {
      userId,
      email,
      timestamp: new Date().toISOString(),
      userRoles,
      companyUsers
    };
  } catch (e) {
    return { error: "Error collecting diagnostic info", details: e };
  }
};

/**
 * Get project leads directly, bypassing RLS policies
 * This is a fallback method when normal fetching fails
 */
export const getProjectLeadsDirectly = async (projectId: string) => {
  if (!projectId) return [];
  
  try {
    console.log(`Directly fetching leads for project: ${projectId}`);
    
    // Direct access to leads via project ID
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id,
        name,
        company,
        email,
        phone,
        position,
        status,
        notes,
        last_contact,
        created_at,
        updated_at,
        score,
        tags,
        project_id,
        extra_data
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error(`Error directly fetching leads for project ${projectId}:`, error);
      throw new Error(error.message || `Error fetching leads for project ${projectId}`);
    }
    
    console.log(`Found ${data.length} leads for project ${projectId}`);
    
    // Project-name separately load
    const { data: projectData } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
      
    const projectName = projectData?.name || 'Unknown Project';
    
    // Process leads
    const processedLeads = data.map(lead => ({
      ...lead,
      project_name: projectName,
      extra_data: lead.extra_data ? 
        (typeof lead.extra_data === 'string' ? JSON.parse(lead.extra_data) : lead.extra_data) : 
        null,
      website: null // Add the required website property
    }));
    
    return processedLeads;
  } catch (error) {
    console.error(`Error in direct lead fetch for project:`, error);
    throw error;
  }
};

/**
 * Get all available projects for the current user
 * This is used for fallback methods
 */
export const getUserProjects = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return [];
    
    const { data: companyData } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();
      
    if (!companyData?.company_id) return [];
    
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('company_id', companyData.company_id);
      
    return projectsData || [];
  } catch (e) {
    console.error('Error fetching user projects:', e);
    return [];
  }
};
