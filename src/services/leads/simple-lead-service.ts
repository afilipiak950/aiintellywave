
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

// Vereinfachte Funktion zum Abrufen aller Leads aus allen Projekten
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    console.log('Fetching all leads from all projects');
    
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
      console.error('Error fetching leads:', error);
      throw error;
    }

    // Leads verarbeiten und zurückgeben
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
      extra_data: lead.extra_data
    }));

    console.log(`Processed ${processedLeads.length} leads`);
    return processedLeads;
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    throw error;
  }
};

// Abrufen von Leads eines bestimmten Projekts
export const fetchProjectLeads = async (projectId: string): Promise<Lead[]> => {
  try {
    console.log(`Fetching leads for project: ${projectId}`);
    
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
      console.error(`Error fetching leads for project ${projectId}:`, error);
      throw error;
    }

    // Leads verarbeiten und zurückgeben
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
      extra_data: lead.extra_data
    }));

    console.log(`Processed ${processedLeads.length} leads for project ${projectId}`);
    return processedLeads;
  } catch (error) {
    console.error(`Failed to fetch leads for project ${projectId}:`, error);
    throw error;
  }
};

// Abrufen aller Projekte
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
    
    console.log('Fetched projects:', data?.length || 0);
    return data;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
};
