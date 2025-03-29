
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { fetchExcelLeadsData } from './lead-excel';

export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    console.log('Lead service: DETAILED Fetching leads with options:', JSON.stringify(options, null, 2));
    
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
    
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      throw leadsError;
    }
    
    console.log('Database leads count:', leadsData?.length || 0);
    
    const regularLeads = leadsData?.map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    })) || [];
    
    const excelLeads = await fetchExcelLeadsData(options);
    console.log('Excel leads count:', excelLeads.length);
    
    const combinedLeads = [...regularLeads, ...excelLeads];
    console.log('Combined total leads:', combinedLeads.length);
    
    return combinedLeads;
  } catch (error) {
    console.error('Comprehensive lead fetch error:', error);
    toast({
      title: 'Lead Fetch Error',
      description: 'Detailed error fetching leads. Check console for specifics.',
      variant: 'destructive'
    });
    return [];
  }
};
