
// Create this file if it doesn't exist

import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

/**
 * Get an appropriate error message based on the error type
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return 'Unbekannter Fehler beim Laden der Leads';
  
  const message = error.message.toLowerCase();
  
  if (message.includes('infinite recursion')) {
    return 'Datenbankrichtlinienfehler: Die Sicherheitsrichtlinien verhindern den Zugriff auf Leads. Verwenden Sie die Schaltfläche "Verbindung reparieren" unten.';
  }
  
  if (message.includes('policy')) {
    return 'Datenbankzugriffsfehler: Sie haben möglicherweise keine ausreichenden Berechtigungen, um auf diese Daten zuzugreifen.';
  }
  
  if (message.includes('no projects found')) {
    return 'Keine Projekte gefunden: Stellen Sie sicher, dass Sie ein Projekt erstellt haben und Ihrem Konto zugeordnet sind.';
  }

  if (message.includes('could not load leads')) {
    return 'Konnte keine Leads laden: Bitte überprüfen Sie Ihre Projektverbindungen und Berechtigungen.';
  }
  
  // Default fallback message
  return error.message;
};

/**
 * Collect diagnostic information for troubleshooting
 */
export const getDiagnosticInfo = async () => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    const userEmail = userData?.user?.email;
    
    // Try to get user's company and role
    const { data: userCompany } = await supabase
      .from('company_users')
      .select('company_id, role, is_admin')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Try to get user's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, company_id')
      .eq('company_id', userCompany?.company_id)
      .limit(5);
    
    return {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      userCompany,
      projects: projects?.map(p => ({ id: p.id, name: p.name })),
      projectsCount: projects?.length,
    };
  } catch (e) {
    // If there's an error during diagnostics, return partial info 
    const { data } = await supabase.auth.getUser();
    return {
      timestamp: new Date().toISOString(),
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: e instanceof Error ? e.message : 'Unknown error during diagnostics'
    };
  }
};

/**
 * Try to repair company associations for the current user
 */
export const attemptCompanyRepair = async () => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      return { 
        success: false, 
        message: 'Nicht authentifiziert. Bitte melden Sie sich erneut an.' 
      };
    }
    
    // Check if the user already has a company association
    const { data: existingAssoc } = await supabase
      .from('company_users')
      .select('company_id, companies (*)')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingAssoc?.company_id) {
      // If user has a company but can't access projects, try to add them to default projects
      const { data: companyProjects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', existingAssoc.company_id)
        .limit(1);
        
      if (companyProjects && companyProjects.length > 0) {
        return { 
          success: true, 
          message: 'Benutzer ist bereits mit einem Unternehmen verbunden. Führe erneuten Ladeversuch durch.',
          company: existingAssoc.companies
        };
      }
      
      // Create a default project for this company if none exist
      const { data: newProject } = await supabase
        .from('projects')
        .insert({
          name: 'Standardprojekt',
          company_id: existingAssoc.company_id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, name')
        .single();
        
      if (newProject) {
        return { 
          success: true, 
          message: 'Standardprojekt für Ihr Unternehmen erfolgreich erstellt.',
          company: existingAssoc.companies
        };
      }
    }
    
    // If user has no company, find the first available company
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1)
      .single();
      
    if (!companies) {
      return { 
        success: false, 
        message: 'Keine Unternehmen gefunden, mit denen eine Verbindung hergestellt werden kann.' 
      };
    }
    
    // Create association between user and company
    const { data: newAssoc, error } = await supabase
      .from('company_users')
      .insert({
        user_id: userId,
        company_id: companies.id,
        role: 'customer',
        email: userData?.user?.email,
        is_admin: false,
        created_at: new Date().toISOString()
      })
      .select('companies (*)')
      .single();
      
    if (error) {
      return { 
        success: false, 
        message: `Fehler beim Erstellen der Unternehmensverbindung: ${error.message}` 
      };
    }
    
    // Create a default project for this user
    const { data: newProject } = await supabase
      .from('projects')
      .insert({
        name: 'Mein erstes Projekt',
        company_id: companies.id,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name')
      .single();
      
    return { 
      success: true, 
      message: 'Verbindung zum Unternehmen hergestellt und Standardprojekt erstellt.',
      company: newAssoc.companies
    };
  } catch (e) {
    return { 
      success: false, 
      message: `Reparaturversuch fehlgeschlagen: ${e instanceof Error ? e.message : 'Unbekannter Fehler'}` 
    };
  }
};

/**
 * Directly get projects for the current user to bypass policy issues
 */
export const getUserProjects = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) return [];
    
    try {
      // Get user's company
      const { data: companyData, error: companyError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userData.user.id);
        
      if (companyError) {
        console.error('Error fetching company_users:', companyError);
        
        // If we get an RLS error, try to use user metadata
        if (companyError.message.includes('policy') || companyError.message.includes('recursion')) {
          const companyId = userData.user.user_metadata?.company_id;
          
          if (companyId) {
            console.log('Using company ID from user metadata:', companyId);
            
            // Try to get projects for this company
            const { data: projectsData } = await supabase
              .from('projects')
              .select('id, name')
              .eq('company_id', companyId);
              
            return projectsData || [];
          }
        }
        
        // No company association found
        console.warn('No company associations found for user');
        return [];
      }
      
      // If we have company data, get projects for each company
      if (companyData && companyData.length > 0) {
        console.log(`Found ${companyData.length} companies for user`);
        
        // Get the first company's projects
        const companyId = companyData[0].company_id;
        
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name')
          .eq('company_id', companyId);
          
        console.log(`Found ${projectsData?.length || 0} projects for company ${companyId}`);
        
        return projectsData || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      return [];
    }
  } catch (error) {
    console.error('Auth error in getUserProjects:', error);
    return [];
  }
};

/**
 * Directly fetch leads for a project to bypass policy issues
 */
export const getProjectLeadsDirectly = async (projectId: string): Promise<Lead[]> => {
  try {
    console.log('Directly fetching leads for project:', projectId);
    
    const { data, error } = await supabase
      .from('leads')
      .select(`
        id, name, company, email, phone, position, status, 
        notes, last_contact, created_at, updated_at,
        score, tags, project_id, extra_data
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error directly fetching leads for project', projectId, ':', error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.log('No leads found for project', projectId);
      return [];
    }
    
    console.log(`Found ${data.length} leads for project ${projectId}`);
    
    // Process leads to ensure they have all required fields
    const processedLeads = data.map(lead => ({
      ...lead,
      website: null,  // Required by Lead type
      project_name: 'Loading...'
    })) as Lead[];
    
    return processedLeads;
  } catch (error) {
    console.error('Error in direct lead fetch for project:', error);
    throw error;
  }
};
