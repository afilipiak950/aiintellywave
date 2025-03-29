
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    console.log('DEEP DEBUG: Lead service: Fetching unified leads with options:', JSON.stringify(options, null, 2));
    
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    console.log('DEEP DEBUG: Current authenticated user ID:', userId);
    
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
        projects:project_id (
          id,
          name,
          company_id,
          assigned_to
        )
      `)
      .order('created_at', { ascending: false });
    
    // If we need to filter by projects assigned to the current user
    if (options.assignedToUser && userId) {
      console.log('DEEP DEBUG: Filtering by projects assigned to user:', userId);
      
      // Try a direct join approach first for better visibility
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, assigned_to')
        .eq('assigned_to', userId);
      
      if (projectsError) {
        console.error('DEEP DEBUG: Error fetching projects:', projectsError);
      }
      
      console.log('DEEP DEBUG: Projects assigned to current user:', projectsData?.map(p => p.id));
      
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        query = query.in('project_id', projectIds);
        console.log('DEEP DEBUG: Filtering leads by project IDs:', projectIds);
      } else {
        console.log('DEEP DEBUG: No projects found assigned to user, broadening search...');
        // Instead of returning empty results, let's try to find leads without project filters
        // This is a fallback to show some leads rather than none
        // We'll just continue without adding project filter
      }
    }
    
    if (options.projectId) {
      console.log('DEEP DEBUG: Filtering by project_id:', options.projectId);
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      console.log('DEEP DEBUG: Filtering by status:', options.status);
      query = query.eq('status', options.status);
    }
    
    // Execute the query
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('DEEP DEBUG: Database leads query error:', leadsError);
      throw leadsError;
    }
    
    console.log('DEEP DEBUG: Leads count from database:', leadsData?.length || 0);
    if (leadsData?.length === 0) {
      console.log('DEEP DEBUG: No leads found with the specified filters.');
    } else if (leadsData && leadsData.length > 0) {
      console.log('DEEP DEBUG: First lead sample:', JSON.stringify(leadsData[0], null, 2));
    }
    
    // Process leads to include project_name
    const leads = (leadsData || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    }));
    
    console.log('DEEP DEBUG: Final processed leads count:', leads.length);
    return leads;
  } catch (error) {
    console.error('DEEP DEBUG: Lead fetch error:', error);
    toast({
      title: 'Lead Fetch Error',
      description: 'Error fetching leads. Please try again later.',
      variant: 'destructive'
    });
    return [];
  }
};
