
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';

/**
 * Alternative Implementierung zum Laden von Leads, die die RLS-Policy-Rekursion umgeht
 * Verwendet eine vereinfachte Abfrage, die keine komplexen Joins oder Policies auslöst
 */
export const fetchLeadsWithFallback = async (): Promise<Lead[]> => {
  try {
    console.log('Verwende alternativen Ladepfad für Leads');
    
    // Vereinfachte Abfrage mit direkter Datenabfrage ohne Policy-Abhängigkeit
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (leadsError) {
      console.error('Fehler im Fallback-Mechanismus (Leads):', leadsError);
      
      // Als Notfall-Fallback versuchen wir auch die Excel-Daten zu laden
      return await fetchExcelLeadsFallback();
    }
    
    // Mapping der Daten zum Lead-Typ
    const processedLeads: Lead[] = leadsData.map(lead => ({
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
    
    // Als letzte Rettung versuchen wir, die Excel-Daten zu laden
    return await fetchExcelLeadsFallback();
  }
};

/**
 * Notfall-Fallback: Lädt Lead-Daten direkt aus der Excel-Tabelle
 * Dies ist der letzte Versuch, wenn alle anderen Methoden fehlschlagen
 */
const fetchExcelLeadsFallback = async (): Promise<Lead[]> => {
  try {
    console.log('Notfall-Fallback: Lade Excel-Daten als Leads');
    
    // Direkte Abfrage der Excel-Daten
    const { data, error } = await supabase
      .from('project_excel_data')
      .select(`
        id,
        row_data,
        project_id,
        row_number,
        approval_status,
        projects:project_id (
          id,
          name
        )
      `)
      .order('row_number', { ascending: true });
    
    if (error) {
      console.error('Fehler beim Laden der Excel-Daten:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('Keine Excel-Daten gefunden');
      return [];
    }
    
    console.log(`${data.length} Excel-Einträge gefunden, wandle in Leads um`);
    
    // Excel-Daten in Leads umwandeln
    const excelLeads: Lead[] = data.map(row => {
      // Namen aus verschiedenen möglichen Feldern extrahieren
      const leadName = 
        row.row_data?.['Name'] || 
        row.row_data?.['name'] || 
        row.row_data?.['Full Name'] ||
        row.row_data?.['FullName'] ||
        `Lead #${row.row_number}`;
        
      // Firma aus verschiedenen möglichen Feldern extrahieren  
      const company = 
        row.row_data?.['Company'] || 
        row.row_data?.['company'] || 
        row.row_data?.['Organisation'] || 
        row.row_data?.['Organization'] ||
        null;
        
      // Email aus verschiedenen möglichen Feldern extrahieren
      const email =
        row.row_data?.['Email'] ||
        row.row_data?.['email'] ||
        row.row_data?.['E-Mail'] ||
        row.row_data?.['E-mail'] ||
        row.row_data?.['Email Address'] ||
        null;
      
      // Telefonnummer aus verschiedenen möglichen Feldern extrahieren
      const phone =
        row.row_data?.['Phone'] ||
        row.row_data?.['phone'] ||
        row.row_data?.['Telephone'] ||
        row.row_data?.['Mobile'] ||
        row.row_data?.['Cell'] ||
        null;
        
      // Position/Titel aus verschiedenen möglichen Feldern extrahieren
      const position =
        row.row_data?.['Position'] ||
        row.row_data?.['position'] ||
        row.row_data?.['Title'] ||
        row.row_data?.['Job Title'] ||
        row.row_data?.['Role'] ||
        null;
        
      // Lead erstellen
      return {
        id: row.id,
        name: leadName,
        company: company,
        email: email,
        phone: phone,
        position: position,
        status: 'new' as any, // Excel-Daten werden als 'new' markiert
        notes: `Aus Excel importiert. Row #${row.row_number}`,
        last_contact: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        score: 0,
        tags: ['excel-import'],
        project_id: row.project_id,
        website: null,
        project_name: row.projects?.name || 'Unbekanntes Projekt',
        extra_data: row.row_data as Record<string, any>
      };
    });
    
    console.log(`${excelLeads.length} Leads aus Excel-Daten erstellt`);
    return excelLeads;
  } catch (error) {
    console.error('Notfall-Fallback-Fehler:', error);
    return [];
  }
};

/**
 * Führt die Excel-zu-Leads-Migration in der Datenbank aus
 * Dies kann helfen, die Leads dauerhaft zu speichern, wenn die RLS-Policies Probleme verursachen
 */
export const migrateExcelToLeads = async (): Promise<number> => {
  try {
    console.log('Starte Migration von Excel-Daten zu Leads...');
    
    const { data, error } = await supabase.rpc('migrate_excel_to_leads');
    
    if (error) {
      console.error('Fehler bei der Migration:', error);
      return 0;
    }
    
    console.log(`Migration abgeschlossen: ${data} Leads erstellt`);
    return data as number;
  } catch (error) {
    console.error('Migration fehlgeschlagen:', error);
    return 0;
  }
};
