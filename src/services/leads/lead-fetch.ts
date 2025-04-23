
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { LeadFetchOptions } from './types/fetch-types';
import { fetchLeadsByProjectDirect } from './utils/project-access';
import { handleEmergencyFallback } from './utils/emergency-fallback';

/**
 * Vereinfachte Funktion zum Abrufen von Leads
 * Gibt alle Leads aus allen Projekten des Benutzers zurück
 */
export const fetchLeadsData = async (options: LeadFetchOptions = {}) => {
  try {
    // Basis-Query erstellen
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
    
    // Filter anwenden, wenn angegeben
    if (options.projectId && options.projectId !== 'all') {
      console.log(`Filtering by specific project: ${options.projectId}`);
      query = query.eq('project_id', options.projectId);
    }
    
    if (options.status) {
      console.log(`Filtering by status: ${options.status}`);
      query = query.eq('status', options.status);
    }
    
    // Limit anwenden und Sortierung
    query = query.limit(options.limit || 100);
    query = query.order('created_at', { ascending: false });
    
    // Query ausführen
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Database leads query error:', leadsError);
      
      // Bei RLS-Fehlern gleich auf die Backup-Methode umschalten
      if (leadsError.code === '42P17' || leadsError.message?.includes('infinite recursion')) {
        console.warn('RLS policy error detected, falling back to direct project access');
        
        if (options.projectId && options.projectId !== 'all') {
          return fetchLeadsByProjectDirect(options.projectId);
        }
        
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          return handleEmergencyFallback(userData.user.id);
        }
      }
      
      throw new Error(leadsError.message || 'Error fetching leads from database');
    }
    
    console.log(`Found ${leadsData?.length || 0} leads matching criteria`);
    
    // Leads verarbeiten, um project_name und extra_data korrekt zu typisieren
    const leads = (leadsData || []).map(lead => {
      const processedLead: Lead = {
        ...lead,
        project_name: lead.projects?.name || 'Unassigned',
        website: null,
        extra_data: null
      };
      
      // Korrekte Verarbeitung des extra_data Felds
      if (lead.extra_data) {
        processedLead.extra_data = typeof lead.extra_data === 'string' 
          ? JSON.parse(lead.extra_data) 
          : lead.extra_data;
      }
      
      return processedLead;
    });
    
    return leads;
  } catch (error) {
    console.error('Lead fetch error:', error);
    throw error instanceof Error ? error : new Error('Error fetching leads');
  }
};

// Utility-Funktionen für den direkten Zugriff exportieren, falls benötigt
export { fetchLeadsByProjectDirect } from './utils/project-access';
