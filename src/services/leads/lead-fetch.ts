
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    console.log('Lead service: Fetching unified leads with options:', JSON.stringify(options, null, 2));
    
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    console.log('Current authenticated user ID:', userId);
    
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
    
    if (options.projectId) {
      console.log('Filtering by project_id:', options.projectId);
      query = options.projectId === 'unassigned' 
        ? query.is('project_id', null) 
        : query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      console.log('Filtering by status:', options.status);
      query = query.eq('status', options.status);
    }

    if (options.assignedToUser && userId) {
      console.log('Filtering by projects assigned to user:', userId);
      query = query.filter('projects.assigned_to', 'eq', userId);
    }
    
    // Execute the query
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      throw leadsError;
    }
    
    console.log('Leads count from database:', leadsData?.length || 0);
    if (leadsData?.length === 0) {
      console.log('No leads found with the specified filters.');
    } else if (leadsData && leadsData.length > 0) {
      console.log('First lead sample:', JSON.stringify(leadsData[0], null, 2));
    }
    
    // Process leads to include project_name
    const leads = (leadsData || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    }));
    
    console.log('Final processed leads count:', leads.length);
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
