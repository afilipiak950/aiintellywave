
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { FallbackProjectLead } from '../types/fetch-types';

export const fetchLeadsByProjectDirect = async (projectId: string): Promise<Lead[]> => {
  if (!projectId) return [];
  
  try {
    console.log(`Directly fetching leads for project: ${projectId}`);
    
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
      console.error(`Error fetching leads for project ${projectId}:`, error);
      return [];
    }
    
    console.log(`Found ${data.length} leads for project ${projectId}`);
    
    // Typensicherer Ansatz für die Verarbeitung der Leads
    const processedLeads = data.map(lead => {
      const processedLead: Lead & Partial<FallbackProjectLead> = {
        ...lead,
        project_name: 'Loading...',
        website: null
      };
      
      // Korrekte Handhabung des extra_data Felds
      if (lead.extra_data) {
        processedLead.extra_data = typeof lead.extra_data === 'string' ? 
          JSON.parse(lead.extra_data) : lead.extra_data;
      } else {
        processedLead.extra_data = null;
      }
      
      return processedLead;
    });
    
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .maybeSingle();
          
      if (projectData?.name) {
        return processedLeads.map(lead => ({
          ...lead,
          project_name: projectData.name
        }));
      }
    } catch (e) {
      console.warn('Error fetching project name:', e);
    }
    
    return processedLeads;
  } catch (error) {
    console.error(`Error in direct project leads fetch:`, error);
    return [];
  }
};
