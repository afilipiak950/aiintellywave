
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

// Simple function to fetch leads from all projects
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching leads from all projects');
    
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
        extra_data,
        projects:project_id (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    // Process leads to ensure proper typing
    const processedLeads: Lead[] = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      status: lead.status as Lead['status'],
      notes: lead.notes,
      last_contact: lead.last_contact,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      score: lead.score || 0,
      tags: lead.tags || [],
      project_id: lead.project_id,
      website: null,
      project_name: lead.projects?.name || 'Unknown Project',
      extra_data: lead.extra_data ? 
        (typeof lead.extra_data === 'string' ? 
          JSON.parse(lead.extra_data) : lead.extra_data) : 
        null
    }));

    return processedLeads;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return [];
  }
};

// Fetch leads by specific project
export const fetchProjectLeads = async (projectId: string): Promise<Lead[]> => {
  try {
    console.log(`Fetching leads for project: ${projectId}`);
    
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
        extra_data,
        projects:project_id (
          id,
          name
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error(`Error fetching leads for project ${projectId}:`, error);
      throw error;
    }

    // Process leads
    const processedLeads: Lead[] = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      status: lead.status as Lead['status'],
      notes: lead.notes,
      last_contact: lead.last_contact,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      score: lead.score || 0,
      tags: lead.tags || [],
      project_id: lead.project_id,
      website: null,
      project_name: lead.projects?.name || 'Unknown Project',
      extra_data: lead.extra_data ? 
        (typeof lead.extra_data === 'string' ? 
          JSON.parse(lead.extra_data) : lead.extra_data) : 
        null
    }));

    return processedLeads;
  } catch (error) {
    console.error(`Failed to fetch leads for project ${projectId}:`, error);
    return [];
  }
};

// Fetch all projects for the user
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
};
