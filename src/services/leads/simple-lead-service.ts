
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

// Simplest possible function to fetch all leads from all projects
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        projects:project_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map to Lead type with proper typing for extra_data
    const processedLeads: Lead[] = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      status: lead.status,
      notes: lead.notes,
      last_contact: lead.last_contact,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      score: lead.score || 0,
      tags: lead.tags || [],
      project_id: lead.project_id,
      website: null,
      project_name: lead.projects?.name || 'Unbekanntes Projekt',
      extra_data: lead.extra_data as Record<string, any> | null
    }));

    return processedLeads;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw error;
  }
};

// Simple function to fetch project leads
export const fetchProjectLeads = async (projectId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        projects:project_id (
          name
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Map to Lead type with proper typing for extra_data
    const processedLeads: Lead[] = data.map(lead => ({
      id: lead.id,
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      position: lead.position,
      status: lead.status,
      notes: lead.notes,
      last_contact: lead.last_contact,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      score: lead.score || 0,
      tags: lead.tags || [],
      project_id: lead.project_id,
      website: null,
      project_name: lead.projects?.name || 'Unbekanntes Projekt',
      extra_data: lead.extra_data as Record<string, any> | null
    }));

    return processedLeads;
  } catch (error) {
    console.error(`Failed to fetch leads for project ${projectId}:`, error);
    throw error;
  }
};

// Simple function to fetch all projects
export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .order('name');

    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
};
