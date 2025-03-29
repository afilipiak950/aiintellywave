
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
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
      // Get projects assigned to current user
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, assigned_to')
        .eq('assigned_to', userId);
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }
      
      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        query = query.in('project_id', projectIds);
      }
    }
    
    if (options.projectId) {
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      query = query.eq('status', options.status);
    }
    
    // Execute the query
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      throw leadsError;
    }
    
    // Process leads to include project_name
    const leads = (leadsData || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    }));
    
    console.log(`Fetched ${leads.length} leads from database`);
    return leads;
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
