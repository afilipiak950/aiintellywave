
import { Lead } from "@/types/lead";
import { Project } from "@/types/project";
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a user-friendly error message from various error types
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return "Unbekannter Fehler beim Laden der Daten";
  
  // Check for network issues first
  if (error.message.includes("Failed to fetch")) {
    return "Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.";
  }
  
  // Check for specific database errors
  if (error.message.includes("permission denied") || 
      error.message.includes("infinite recursion")) {
    return "Datenbankfehler: Zugriffsrechte fehlen oder es gab einen Datenbank-Richtlinienfehler.";
  }
  
  // Return a general error message with the original error for debugging
  return `Fehler beim Laden der Daten: ${error.message}`;
};

/**
 * Optimized method to get user's projects with caching
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    // Use localStorage cache if available and not expired
    const cachedData = localStorage.getItem('cached_projects');
    const cacheTimestamp = localStorage.getItem('cached_projects_timestamp');
    
    // Cache is valid for 5 minutes
    if (cachedData && cacheTimestamp) {
      const isRecent = (Date.now() - parseInt(cacheTimestamp)) < 300000; // 5 minutes
      if (isRecent) {
        console.log('Using cached projects data');
        return JSON.parse(cachedData) as Project[];
      }
    }
    
    console.log('Fetching fresh projects data');
    
    // Get the user's ID first
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("Nicht authentifiziert");
    }
    
    // Try to get projects directly with minimal fields
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name')
      .limit(20); // Limit the number of projects for better performance
      
    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    
    // Cache the results
    localStorage.setItem('cached_projects', JSON.stringify(data));
    localStorage.setItem('cached_projects_timestamp', Date.now().toString());
    
    return data as Project[];
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    
    // Try to return cached data even if it's expired, as a fallback
    const cachedData = localStorage.getItem('cached_projects');
    if (cachedData) {
      console.log('Using expired cache as fallback');
      return JSON.parse(cachedData) as Project[];
    }
    
    return [];
  }
};

/**
 * Optimized method to get project leads bypassing hooks
 */
export const getProjectLeads = async (projectId?: string): Promise<Lead[]> => {
  try {
    // Check cache first
    const cacheKey = `cached_leads_${projectId || 'all'}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    // Cache is valid for 2 minutes
    if (cachedData && cacheTimestamp) {
      const isRecent = (Date.now() - parseInt(cacheTimestamp)) < 120000; // 2 minutes
      if (isRecent) {
        console.log('Using cached leads data');
        return JSON.parse(cachedData) as Lead[];
      }
    }
    
    console.log('Fetching fresh leads data');
    
    // Use a simplified query with fewer fields for better performance
    let query = supabase
      .from('leads')
      .select(`
        id, name, company, email, phone, status, 
        project_id
      `)
      .limit(50) // Limit the number of leads
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
    
    // Process leads with minimal data
    const processedLeads = data.map(lead => ({
      ...lead,
      project_name: 'Projekt',
      website: null
    })) as Lead[];
    
    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify(processedLeads));
    localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    
    return processedLeads;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    
    // Try to return cached data even if it's expired, as a fallback
    const cacheKey = `cached_leads_${projectId || 'all'}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('Using expired cache as fallback');
      return JSON.parse(cachedData) as Lead[];
    }
    
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
      userEmail: authData?.user?.email,
      timestamp: new Date().toISOString(),
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      }
    };
  } catch (error) {
    console.error('Error getting diagnostic info:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
