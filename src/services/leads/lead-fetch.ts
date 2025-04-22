
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
    throw error;
  }
};

// Direkte Methode zum Laden von Leads eines Projekts (ohne RLS-Abhängigkeiten)
export const fetchLeadsByProjectDirect = async (projectId: string): Promise<Lead[]> => {
  if (!projectId) return [];
  
  try {
    console.log(`Directly fetching leads for project: ${projectId}`);
    
    // Direkter Zugriff auf Leads über Projekt-ID
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
      throw error;
    }
    
    console.log(`Found ${data.length} leads for project ${projectId}`);
    
    // Projekt-Name separat laden
    const { data: projectData } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
      
    const projectName = projectData?.name || 'Unbekanntes Projekt';
    
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
    throw error;
  }
};
