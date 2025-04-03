
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.error('No authenticated user found');
      return [];
    }
    
    console.log('Fetching leads for user:', userId);
    
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
    
    // If we're filtering by projects assigned to the current user
    if (options.assignedToUser) {
      console.log('Filtering by projects assigned to current user');
      
      // Get projects assigned to current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .or(`assigned_to.eq.${userId}`);
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw new Error('Failed to fetch user projects');
      }
      
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        console.log('Found user projects:', projectIds.length);
        query = query.in('project_id', projectIds);
      } else {
        console.log('No projects found for user - returning empty leads array');
        return [];
      }
    }
    
    // Apply project filter if specified
    if (options.projectId) {
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    // Apply status filter if specified
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Execute the query
    const { data: leadsData, error: leadsError } = await query.order('created_at', { ascending: false });
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      throw leadsError;
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
    toast({
      title: 'Lead Fetch Error',
      description: 'Error fetching leads. Please try again later.',
      variant: 'destructive'
    });
    return [];
  }
};
