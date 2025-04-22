
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
    // Start building the query - much simpler approach
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
          company_id
        )
      `);
    
    // Simple project filter if provided
    if (options.projectId && options.projectId !== 'all') {
      console.log(`Filtering by specific project: ${options.projectId}`);
      query = query.eq('project_id', options.projectId);
    }
    
    // Apply status filter if specified
    if (options.status) {
      console.log(`Filtering by status: ${options.status}`);
      query = query.eq('status', options.status);
    }
    
    // Apply limit to reduce payload size and improve performance
    query = query.limit(options.limit || 100);
    
    // Order by created_at descending
    query = query.order('created_at', { ascending: false });
    
    // Execute the query
    console.log('Executing leads query with filters:', options);
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      
      // If we get an RLS error, try the backup method immediately
      if (leadsError.code === '42P17' || leadsError.message?.includes('infinite recursion')) {
        console.warn('RLS policy error detected, falling back to direct project access');
        
        // If project ID is provided, use direct project access as fallback
        if (options.projectId && options.projectId !== 'all') {
          return fetchLeadsByProjectDirect(options.projectId);
        }
      }
      
      // Ensure error is properly formatted for display
      throw new Error(leadsError.message || 'Error fetching leads from database');
    }
    
    console.log(`Found ${leadsData?.length || 0} leads matching criteria`);
    
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
    
    // New: For user_roles recursive policy errors, try the emergency fallback
    if (error.message?.includes('infinite recursion') && error.message?.includes('user_roles')) {
      console.warn('RLS policy error on user_roles detected, trying emergency fallback method');
      try {
        // Try to get company ID directly
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) throw new Error('Not authenticated');
        
        // Get all leads from all projects the user might have access to
        const { data: projectsData } = await supabase
          .from('projects')
          .select('id, name')
          .limit(10);
          
        if (!projectsData || projectsData.length === 0) {
          console.log('No projects found in emergency fallback');
          throw new Error('No projects found. Please check your permissions.');
        }
        
        console.log(`Found ${projectsData.length} projects, attempting direct lead fetch`);
        
        // Try getting leads from the first few projects
        for (const project of projectsData) {
          try {
            const projectLeads = await fetchLeadsByProjectDirect(project.id);
            if (projectLeads && projectLeads.length > 0) {
              console.log(`Successfully fetched ${projectLeads.length} leads from project ${project.id}`);
              return projectLeads;
            }
          } catch (projError) {
            console.warn(`Failed to fetch leads for project ${project.id}:`, projError);
            // Continue trying with other projects
          }
        }
        
        throw new Error('Could not fetch leads from any projects');
      } catch (fallbackError) {
        console.error('Emergency fallback failed:', fallbackError);
        throw fallbackError instanceof Error 
          ? fallbackError 
          : new Error('Failed to fetch leads using fallback mechanism');
      }
    }
    
    // Ensure error is properly formatted for display
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error fetching leads');
  }
};

// Direct method for loading leads of a project (without RLS dependencies)
export const fetchLeadsByProjectDirect = async (projectId: string): Promise<Lead[]> => {
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
      .limit(100);
    
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
    
    // Process leads to include project_name and website property
    const processedLeads = data.map(lead => ({
      ...lead,
      project_name: projectName,
      extra_data: lead.extra_data ? 
        (typeof lead.extra_data === 'string' ? JSON.parse(lead.extra_data) : lead.extra_data) : 
        null,
      website: null // Add the required website property
    } as Lead));
    
    return processedLeads;
  } catch (error) {
    console.error(`Error in direct lead fetch for project:`, error);
    
    // Last resort: try getting leads with a different approach
    try {
      console.log('Attempting last resort method to fetch leads...');
      const { data: lastResortData, error: lastResortError } = await supabase
        .from('leads')
        .select('*')
        .eq('project_id', projectId)
        .limit(100);
        
      if (lastResortError) {
        console.error('Last resort method failed:', lastResortError);
        throw new Error(lastResortError.message || 'Last resort fetch failed');
      }
      
      if (lastResortData && lastResortData.length > 0) {
        console.log(`Last resort method found ${lastResortData.length} leads`);
        
        // Process these leads with minimal transformation
        return lastResortData.map(lead => ({
          ...lead,
          project_name: 'Unknown Project',
          website: null,
          extra_data: lead.extra_data ? 
            (typeof lead.extra_data === 'string' ? JSON.parse(lead.extra_data) : lead.extra_data) : 
            null
        })) as Lead[];
      }
      
      throw new Error('No leads found with last resort method');
    } catch (lastResortError) {
      console.error('Last resort failed completely:', lastResortError);
      throw lastResortError instanceof Error 
        ? lastResortError 
        : new Error('All methods to fetch leads failed');
    }
  }
};
