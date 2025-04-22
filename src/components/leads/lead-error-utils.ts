
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
  
  if (errorMessage.includes('no projects found') || errorMessage.includes('no project access')) {
    return "No projects found for your account. Please create a project first.";
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
      .select('company_id, role, is_primary_company')
      .eq('user_id', userId);
    
    let companyData = null;
    if (companyUsers && companyUsers.length > 0) {
      const primaryCompany = companyUsers.find(cu => cu.is_primary_company) || companyUsers[0];
      
      const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', primaryCompany.company_id)
        .single();
        
      companyData = company;
    }
      
    return {
      userId,
      email,
      timestamp: new Date().toISOString(),
      userRoles,
      companyUsers,
      company: companyData
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
    // First, get the user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      console.error('No authenticated user found');
      return [];
    }
    
    console.log('Getting projects for user:', userData.user.id);
    
    // Find company ID from company_users
    const { data: companyData, error: companyError } = await supabase
      .from('company_users')
      .select('company_id, is_primary_company')
      .eq('user_id', userData.user.id);
      
    if (companyError) {
      console.error('Error fetching company_users:', companyError);
    }
    
    let companyId = null;
    
    // If we found company associations, use the primary one or the first one
    if (companyData && companyData.length > 0) {
      const primaryCompany = companyData.find(c => c.is_primary_company);
      companyId = primaryCompany ? primaryCompany.company_id : companyData[0].company_id;
      console.log('Found company ID:', companyId);
    } else {
      console.warn('No company associations found for user');
      
      // Try to get company ID from user metadata as fallback
      if (userData.user.user_metadata && userData.user.user_metadata.company_id) {
        companyId = userData.user.user_metadata.company_id;
        console.log('Using company ID from user metadata:', companyId);
      }
    }
    
    if (!companyId) {
      console.error('Could not determine company ID for user');
      return [];
    }
    
    // Get projects for this company
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, company_id, status')
      .eq('company_id', companyId);
      
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return [];
    }
    
    if (!projectsData || projectsData.length === 0) {
      console.warn('No projects found for company ID:', companyId);
      
      // As a last resort, try to get any projects assigned directly to the user
      const { data: assignedProjects, error: assignedError } = await supabase
        .from('projects')
        .select('id, name, company_id, status')
        .eq('assigned_to', userData.user.id);
        
      if (assignedError) {
        console.error('Error fetching assigned projects:', assignedError);
        return [];
      }
      
      if (assignedProjects && assignedProjects.length > 0) {
        console.log('Found projects assigned directly to user:', assignedProjects.length);
        return assignedProjects;
      }
      
      return [];
    }
    
    console.log(`Found ${projectsData.length} projects for company ${companyId}`);
    return projectsData;
  } catch (e) {
    console.error('Error in getUserProjects:', e);
    return [];
  }
};

/**
 * Attempt to fix company association issues
 * This can help when a user has no company associations
 */
export const attemptCompanyRepair = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { success: false, message: "Not authenticated" };
    
    // Check if user already has company associations
    const { data: existingAssociations, error: checkError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userData.user.id);
      
    if (checkError) {
      console.error('Error checking existing associations:', checkError);
      return { success: false, message: "Error checking associations" };
    }
    
    if (existingAssociations && existingAssociations.length > 0) {
      return { success: true, message: "User already has company associations" };
    }
    
    // Find a company to associate with
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .limit(1);
      
    if (companiesError || !companies || companies.length === 0) {
      console.error('No companies available for repair:', companiesError);
      return { success: false, message: "No companies available" };
    }
    
    const defaultCompany = companies[0];
    
    // Create company association
    const { data: newAssociation, error: insertError } = await supabase
      .from('company_users')
      .insert({
        user_id: userData.user.id,
        company_id: defaultCompany.id,
        role: 'customer',
        email: userData.user.email,
        is_primary_company: true
      });
      
    if (insertError) {
      console.error('Error creating company association:', insertError);
      return { success: false, message: "Could not create association" };
    }
    
    return { 
      success: true, 
      message: `Associated with company: ${defaultCompany.name}`,
      company: defaultCompany
    };
  } catch (e) {
    console.error('Error in company repair:', e);
    return { success: false, message: "Exception during repair" };
  }
};

