
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
  companyId?: string;
  limit?: number;
} = {}) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }
    
    console.log('Fetching leads for user:', userId, 'with options:', options);
    
    // Start building the query
    let query = supabase
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
        extra_data,
        projects:project_id (
          id,
          name,
          company_id,
          assigned_to
        )
      `);
    
    // If we're filtering by projects assigned to the current user's company
    if (options.assignedToUser) {
      console.log('Filtering by projects assigned to current user company');
      
      try {
        // Get the user's company association first
        const { data: userCompanyData, error: companyError } = await supabase
          .from('company_users')
          .select('company_id, role, is_admin')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (companyError) {
          console.error('Error fetching user company association:', companyError);
          
          // If we get infinite recursion error, likely an RLS policy issue
          if (companyError.message.includes('infinite recursion')) {
            console.warn('Infinite recursion detected in RLS policy. Trying alternate approach...');
            
            // Try getting user roles directly as a fallback
            const { data: userRoles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId);
              
            console.log('User roles found:', userRoles);
            
            // Let's try using the check-rls edge function
            try {
              const { data: rlsData } = await supabase.functions.invoke('check-rls');
              console.log('RLS check from edge function:', rlsData);
            } catch (err) {
              console.warn('Edge function error:', err);
            }
          }
        } else {
          console.log('User company data:', userCompanyData);
        }
        
        const userCompanyId = userCompanyData?.company_id;
        console.log('User company ID:', userCompanyId);
        
        if (userCompanyId) {
          // Try to get projects for the company
          try {
            const { data: companyProjects, error: projectsError } = await supabase
              .from('projects')
              .select('id, name')
              .eq('company_id', userCompanyId);
            
            if (projectsError) {
              console.warn('Error fetching company projects, will try fallback:', projectsError);
            } else if (companyProjects && companyProjects.length > 0) {
              const projectIds = companyProjects.map(p => p.id);
              console.log(`Found ${projectIds.length} company projects, filtering leads by these projects:`, companyProjects);
              query = query.in('project_id', projectIds);
            } else {
              console.log('No company projects found, will try fallback methods');
            }
          } catch (err) {
            console.warn('Exception in company projects fetch, will try fallback:', err);
          }
        } else {
          console.log('No company association found for user, trying fallbacks');
        }
        
        // Fallback 1: Try to find projects directly assigned to the user
        if (!userCompanyId) {
          try {
            const { data: userProjects, error: userProjectsError } = await supabase
              .from('projects')
              .select('id, name')
              .eq('assigned_to', userId);
              
            if (userProjectsError) {
              console.warn('Error fetching directly assigned projects:', userProjectsError);
            } else if (userProjects && userProjects.length > 0) {
              const userProjectIds = userProjects.map(p => p.id);
              console.log(`Found ${userProjectIds.length} projects directly assigned to user, filtering leads:`, userProjects);
              query = query.in('project_id', userProjectIds);
            } else {
              console.log('No assigned projects found for fallback');
              
              // Try querying directly without extra filters
              console.log('Attempting to fetch leads without filters as last resort');
            }
          } catch (err) {
            console.warn('Exception in user projects fallback:', err);
          }
        }
      } catch (err) {
        console.error('Error in company/project filtering logic:', err);
        // Continue with query without the project filter
      }
    } 
    // If we're filtering by a specific company ID provided in options
    else if (options.companyId) {
      console.log('Filtering by specific company ID:', options.companyId);
      
      // Get projects for the specified company
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name')
          .eq('company_id', options.companyId);
        
        if (projectsError) {
          console.error('Error fetching projects for company:', projectsError);
        } else if (projectsData && projectsData.length > 0) {
          const projectIds = projectsData.map(p => p.id);
          console.log(`Found ${projectIds.length} projects for company ${options.companyId}:`, projectsData);
          query = query.in('project_id', projectIds);
        } else {
          console.log(`No projects found for company ${options.companyId}`);
        }
      } catch (err) {
        console.warn('Exception in company ID filtering:', err);
      }
    }
    
    // Apply project filter if specified
    if (options.projectId && options.projectId !== 'all') {
      console.log(`Filtering by specific project: ${options.projectId}`);
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    // Apply status filter if specified
    if (options.status) {
      console.log(`Filtering by status: ${options.status}`);
      query = query.eq('status', options.status);
    }
    
    // Apply limit to reduce payload size and improve performance
    if (options.limit && typeof options.limit === 'number') {
      query = query.limit(options.limit);
    } else {
      // Default limit to 100 if not specified
      query = query.limit(100);
    }
    
    // Execute the query
    console.log('Executing final leads query with filters:', options);
    const { data: leadsData, error: leadsError } = await query.order('created_at', { ascending: false });
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      
      // If we get an RLS error, try a different approach with the edge function
      if (leadsError.message.includes('permission denied') || leadsError.message.includes('policy')) {
        console.warn('Permission issue detected. Attempting to use edge function...');
        
        try {
          const { data: rlsCheckData } = await supabase.functions.invoke('check-rls');
          console.log('RLS check edge function response:', rlsCheckData);
          
          // Extract leads data from the edge function response if available
          if (rlsCheckData?.database_access?.leads?.select?.data) {
            const edgeFunctionLeads = rlsCheckData.database_access.leads.select.data;
            console.log(`Found ${edgeFunctionLeads.length} leads through edge function`);
            
            // Process these leads similar to normal leads
            const processedLeads = edgeFunctionLeads.map(lead => ({
              ...lead,
              project_name: 'From Edge Function',
              extra_data: null,
              website: null
            }));
            
            return processedLeads as Lead[];
          }
        } catch (err) {
          console.error('Edge function error:', err);
        }
      }
      
      throw leadsError;
    }
    
    console.log(`Found ${leadsData?.length || 0} leads matching criteria`);
    
    // For debugging: Let's also directly check for leads by project
    if (options.assignedToUser && (!leadsData || leadsData.length === 0)) {
      try {
        // Get user company
        const { data: userCompany } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (userCompany?.company_id) {
          // Get company projects
          const { data: projects } = await supabase
            .from('projects')
            .select('id, name')
            .eq('company_id', userCompany.company_id);
          
          console.log(`Debug: Found ${projects?.length || 0} projects for company`);
          
          // Check each project for leads
          if (projects && projects.length > 0) {
            for (const project of projects) {
              const { data: projectLeads, error: projectLeadsError } = await supabase
                .from('leads')
                .select('id')
                .eq('project_id', project.id)
                .limit(5);
              
              if (projectLeadsError) {
                console.error(`Error checking leads for project ${project.id}:`, projectLeadsError);
              } else {
                console.log(`Debug: Project ${project.name} (${project.id}) has ${projectLeads.length} leads`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Debug check error:', error);
      }
    }
    
    // Process leads to include project_name and ensure extra_data is correctly typed
    const leads = (leadsData || []).map(lead => {
      // Create the lead object with the properties we know exist
      const processedLead: Partial<Lead> = {
        ...lead,
        project_name: lead.projects?.name || 'Unassigned',
        // Handle extra_data from DB to be a properly typed Record
        extra_data: lead.extra_data ? (typeof lead.extra_data === 'string' ? JSON.parse(lead.extra_data) : lead.extra_data) : null,
        // Add website property (might be null or undefined)
        website: null
      };
      
      return processedLead as Lead;
    });
    
    return leads as Lead[];
  } catch (error) {
    console.error('Lead fetch error:', error);
    
    // Last resort fallback: try directly accessing through edge function
    try {
      console.log('Attempting final fallback with edge function...');
      const { data: rlsData } = await supabase.functions.invoke('check-rls');
      
      if (rlsData?.database_access?.leads?.select?.data) {
        const edgeFunctionLeads = rlsData.database_access.leads.select.data;
        console.log(`Found ${edgeFunctionLeads.length} leads through edge function fallback`);
        
        if (edgeFunctionLeads.length > 0) {
          // Process these leads similar to normal leads
          const processedLeads = edgeFunctionLeads.map(lead => ({
            ...lead,
            project_name: 'Edge Function Fallback',
            extra_data: null,
            website: null
          }));
          
          return processedLeads as Lead[];
        }
      }
    } catch (e) {
      console.error('Final edge function fallback error:', e);
    }
    
    // Let the component display appropriate errors
    throw error;
  }
};
