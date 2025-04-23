
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

/**
 * Alternative Implementierung zum Laden von Leads, die die RLS-Policy-Rekursion umgeht
 * Verwendet eine vereinfachte Abfrage, die keine komplexen Joins oder Policies auslöst
 */
export const fetchLeadsWithFallback = async (): Promise<Lead[]> => {
  try {
    console.log('Verwende alternativen Ladepfad für Leads');
    
    // Vereinfachte Abfrage mit minimaler Policy-Abhängigkeit
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Fehler im Fallback-Mechanismus:', error);
      return [];
    }
    
    // Mapping der Daten zum Lead-Typ
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
      project_name: 'Unbekanntes Projekt', // Default-Wert
      extra_data: lead.extra_data as Record<string, any> | null
    }));
    
    // Separat die Projektnamen laden
    try {
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name');
      
      if (projectsData && projectsData.length > 0) {
        // Map für schnellen Zugriff erstellen
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
      console.warn('Projektnamen konnten nicht geladen werden:', projectError);
      // Trotzdem mit den Lead-Daten fortfahren
    }
    
    return processedLeads;
  } catch (error) {
    console.error('Fallback-Lead-Service Fehler:', error);
    return [];
  }
};
