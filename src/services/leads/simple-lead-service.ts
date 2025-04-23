
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

// Funktion zum direkten Laden aller Leads ohne komplexe Joins
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    // Einfache Abfrage ohne komplexe Joins
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Mapping zu Lead-Typ mit korrekter Konvertierung für extra_data
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
      project_name: 'Unbekanntes Projekt', // Standardwert, wenn Projekt nicht bekannt
      extra_data: lead.extra_data as Record<string, any> | null
    }));

    // Jetzt separat die Projektnamen abrufen, wenn möglich
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name');
        
      if (projectsData) {
        // Map für schnellen Zugriff auf Projektnamen
        const projectMap = new Map();
        projectsData.forEach(project => {
          projectMap.set(project.id, project.name);
        });
        
        // Projektnamen zu Leads hinzufügen
        processedLeads.forEach(lead => {
          if (lead.project_id && projectMap.has(lead.project_id)) {
            lead.project_name = projectMap.get(lead.project_id);
          }
        });
      }
    } catch (projectError) {
      console.warn('Konnte Projektnamen nicht laden:', projectError);
      // Fahre trotzdem fort, da dies nicht kritisch ist
    }

    return processedLeads;
  } catch (error) {
    console.error('Fehler beim Laden der Leads:', error);
    throw error;
  }
};

// Funktion zum direkten Laden von Leads eines bestimmten Projekts
export const fetchProjectLeads = async (projectId: string): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Mapping zu Lead-Typ mit korrekter Konvertierung für extra_data
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
      project_name: 'Unbekanntes Projekt',
      extra_data: lead.extra_data as Record<string, any> | null
    }));

    // Projektnamen separat laden
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
        
      if (projectData?.name) {
        // Projektnamen zu allen Leads hinzufügen
        processedLeads.forEach(lead => {
          lead.project_name = projectData.name;
        });
      }
    } catch (projectError) {
      console.warn(`Konnte Projektnamen für Projekt ${projectId} nicht laden:`, projectError);
      // Fahre trotzdem fort
    }

    return processedLeads;
  } catch (error) {
    console.error(`Fehler beim Laden der Leads für Projekt ${projectId}:`, error);
    throw error;
  }
};

// Funktion zum Laden aller Projekte
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
    console.error('Fehler beim Laden der Projekte:', error);
    return [];
  }
};
