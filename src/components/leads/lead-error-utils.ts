
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
  
  // Handle RLS policy errors specifically - these are common in the logs
  if (error.message.includes("infinite recursion") || 
      error.message.includes("42P17")) {
    return "Datenbankrichtlinienfehler: Die Datenbank konnte aufgrund von Zugriffsrichtlinien nicht abgefragt werden. Bitte verwenden Sie die Cache-Option oder wenden Sie sich an den Support.";
  }
  
  // Check for specific database errors
  if (error.message.includes("permission denied")) {
    return "Datenbankfehler: Zugriffsrechte fehlen oder es gab einen Datenbank-Richtlinienfehler.";
  }
  
  // Return a general error message with the original error for debugging
  return `Fehler beim Laden der Daten: ${error.message}`;
};

/**
 * Optimized method to get user's projects with caching and fallback mechanisms
 */
export const getUserProjects = async (): Promise<Project[]> => {
  try {
    // Use localStorage cache if available and not expired
    const cachedData = localStorage.getItem('cached_projects');
    const cacheTimestamp = localStorage.getItem('cached_projects_timestamp');
    
    // Cache is valid for 30 minutes (increased from 5 minutes)
    if (cachedData && cacheTimestamp) {
      const isRecent = (Date.now() - parseInt(cacheTimestamp)) < 1800000; // 30 minutes
      if (isRecent) {
        console.log('Using cached projects data (valid for 30 minutes)');
        return JSON.parse(cachedData) as Project[];
      } else {
        console.log('Cache expired, fetching fresh data');
      }
    }
    
    console.log('Fetching fresh projects data');
    
    // Get the user's ID first
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) {
      throw new Error("Nicht authentifiziert");
    }
    
    // Multiple approaches to get projects - first try direct query
    let projects: Project[] = [];
    let error: any = null;
    
    try {
      // Try to get projects directly with minimal fields
      const { data, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status, company_id, assigned_to')
        .order('name')
        .limit(50); // Increased limit for better coverage
      
      if (!projectsError && data?.length) {
        console.log('Successfully fetched projects via direct query:', data.length);
        projects = data as Project[];
      } else {
        error = projectsError;
        console.warn('Primary project fetch approach failed:', projectsError);
      }
    } catch (directError) {
      error = directError;
      console.warn('Primary approach error:', directError);
    }
    
    // If direct approach failed, try getting projects assigned to the user
    if (projects.length === 0) {
      try {
        const { data: assignedProjects, error: assignedError } = await supabase
          .from('projects')
          .select('id, name, status, company_id, assigned_to')
          .eq('assigned_to', userData.user.id)
          .order('name');
          
        if (!assignedError && assignedProjects?.length) {
          console.log('Successfully fetched assigned projects:', assignedProjects.length);
          projects = assignedProjects as Project[];
        }
      } catch (assignedError) {
        console.warn('Assigned projects fetch failed:', assignedError);
      }
    }
    
    // Third attempt - try without filtering or complex queries at all
    if (projects.length === 0) {
      try {
        // Simple query just to get any accessible projects
        const { data: simpleProjects } = await supabase
          .from('projects')
          .select('id, name')
          .limit(20);
          
        if (simpleProjects?.length) {
          console.log('Successfully fetched some projects via simple query:', simpleProjects.length);
          projects = simpleProjects as Project[];
        }
      } catch (simpleError) {
        console.warn('Simple projects fetch also failed:', simpleError);
      }
    }
    
    // If we got projects, cache them
    if (projects.length > 0) {
      localStorage.setItem('cached_projects', JSON.stringify(projects));
      localStorage.setItem('cached_projects_timestamp', Date.now().toString());
      console.log('Cached', projects.length, 'projects');
      return projects;
    }
    
    // If all approaches failed, throw the original error or a default
    if (error) throw error;
    throw new Error("Keine Projekte gefunden oder Zugriffsfehler");
    
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    
    // Try to return cached data even if it's expired, as a fallback
    const cachedData = localStorage.getItem('cached_projects');
    if (cachedData) {
      console.log('Using expired cache as fallback for projects');
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
    
    // Cache is valid for 10 minutes (increased from 2 minutes)
    if (cachedData && cacheTimestamp) {
      const isRecent = (Date.now() - parseInt(cacheTimestamp)) < 600000; // 10 minutes
      if (isRecent) {
        console.log('Using cached leads data (valid for 10 minutes)');
        return JSON.parse(cachedData) as Lead[];
      } else {
        console.log('Leads cache expired, fetching fresh data');
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
      .limit(100) // Increased limit for better coverage
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
    console.log('Cached', processedLeads.length, 'leads');
    
    return processedLeads;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    
    // Try to return cached data even if it's expired, as a fallback
    const cacheKey = `cached_leads_${projectId || 'all'}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('Using expired cache as fallback for leads');
      return JSON.parse(cachedData) as Lead[];
    }
    
    throw error;
  }
};

/**
 * Preload projects in the background to improve perceived performance
 */
export const preloadProjectsInBackground = () => {
  // Schedule preload after the main page content has loaded
  setTimeout(() => {
    console.log('Preloading projects data in background');
    getUserProjects().catch(err => console.log('Background preload error:', err));
  }, 1000);
};

/**
 * Get diagnostic information about the current user session and permissions
 */
export const getDiagnosticInfo = async () => {
  try {
    // Check authentication
    const { data: authData } = await supabase.auth.getUser();
    
    const cacheInfo: Record<string, any> = {};
    
    // Check cache status
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cached_projects') || key.startsWith('cached_leads'))) {
        const timestamp = localStorage.getItem(`${key}_timestamp`);
        if (timestamp) {
          const age = Math.round((Date.now() - parseInt(timestamp)) / 60000); // minutes
          cacheInfo[key] = `${age} minutes old`;
        } else {
          cacheInfo[key] = 'timestamp missing';
        }
      }
    }
    
    return {
      isAuthenticated: !!authData?.user,
      userId: authData?.user?.id,
      userEmail: authData?.user?.email,
      timestamp: new Date().toISOString(),
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine
      },
      cacheStatus: cacheInfo
    };
  } catch (error) {
    console.error('Error getting diagnostic info:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
};
