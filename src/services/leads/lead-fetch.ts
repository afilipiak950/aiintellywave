
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
    
    // Process regular leads to include project_name
    const regularLeads = (leadsData || []).map(lead => ({
      ...lead,
      project_name: lead.projects?.name || 'No Project',
    }));
    
    // Get Excel leads and transform them into proper Lead objects
    const excelLeads = await fetchExcelLeadsData(options);
    console.log('Excel leads count:', excelLeads.length);
    
    // Transform Excel leads to match Lead interface better by supplying defaults
    const transformedExcelLeads = excelLeads.map(excelLead => ({
      id: excelLead.id || `excel-${Math.random().toString(36).substring(2, 9)}`,
      name: excelLead.name || 'Unnamed Lead',
      company: excelLead.company || null,
      email: excelLead.email || null,
      phone: excelLead.phone || null,
      position: excelLead.position || null,
      status: excelLead.status || 'new' as Lead['status'],
      notes: excelLead.notes || null,
      last_contact: excelLead.last_contact || null,
      created_at: excelLead.created_at || new Date().toISOString(),
      updated_at: excelLead.updated_at || new Date().toISOString(),
      score: excelLead.score || 0,
      tags: excelLead.tags || [],
      project_id: excelLead.project_id || null,
      project_name: 'Excel Import',
      excel_data: excelLead.excel_data || true, // Mark as Excel data for UI distinction if needed
    }));
    
    // Combine database leads with Excel leads
    const combinedLeads = [...regularLeads, ...transformedExcelLeads] as Lead[];
    console.log('Combined total leads:', combinedLeads.length);
    
    return combinedLeads;
  } catch (error) {
    console.error('Comprehensive lead fetch error:', error);
    toast({
      title: 'Lead Fetch Error',
      description: 'Error fetching leads. Please try again later.',
      variant: 'destructive'
    });
    return [];
  }
};
