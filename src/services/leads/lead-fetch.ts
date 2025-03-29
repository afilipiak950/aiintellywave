
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches leads from the database with optional filtering
 */
export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    console.log('Lead service: Fetching leads with options:', options);
    
    // Get current user id for assigned leads filtering
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Build a query that resolves the ambiguous column issue
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
    
    // Apply filters if provided
    if (options.projectId) {
      console.log('Lead service: Filtering by project_id:', options.projectId);
      // Handle the special case for "unassigned" leads
      if (options.projectId === 'unassigned') {
        query = query.is('project_id', null);
      } else {
        query = query.eq('project_id', options.projectId);
      }
    }
    
    if (options.status) {
      console.log('Lead service: Filtering by status:', options.status);
      query = query.eq('status', options.status);
    }

    // If assignedToUser is true, filter by projects assigned to the current user
    if (options.assignedToUser && userId) {
      console.log('Lead service: Filtering by projects assigned to user:', userId);
      // We need to join with projects to filter by assigned_to
      query = query.filter('projects.assigned_to', 'eq', userId);
    }
    
    console.log('Lead service: Executing Supabase query');
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Lead service: Error in Supabase query:', leadsError);
      throw leadsError;
    }
    
    // Transform regular leads data
    const regularLeads = leadsData?.map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    })) || [];
    
    // Fetch Excel leads separately using the dedicated function
    const excelLeads = await fetchExcelLeadsData(options);
    
    // Combine regular leads with excel leads
    console.log('Lead service: Regular leads count:', regularLeads.length);
    console.log('Lead service: Excel leads count:', excelLeads.length);
    
    const combinedLeads = [...regularLeads, ...excelLeads];
    console.log('Lead service: Combined leads count:', combinedLeads.length);
    
    return combinedLeads;
  } catch (error) {
    console.error('Lead service: Error fetching leads:', error);
    toast({
      title: 'Error',
      description: 'Failed to load leads data. Please try again.',
      variant: 'destructive'
    });
    return [];
  }
};

/**
 * Helper function to get Excel lead data from project_excel_data table
 */
import { fetchExcelLeadsData } from './lead-excel';
