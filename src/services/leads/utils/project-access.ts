
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { FallbackProjectLead } from '../types/fetch-types';

/**
 * Fetches leads directly from a specific project, bypassing the join approach
 * This is used as a fallback when RLS policies cause issues
 */
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
    
    // Process leads with type safety
    const processedLeads: Lead[] = data.map(lead => {
      // Create a base lead object with proper typing
      const processedLead: Lead = {
        id: lead.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        position: lead.position,
        status: lead.status as Lead['status'], // Type assertion for safety
        notes: lead.notes,
        last_contact: lead.last_contact,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
        score: lead.score,
        tags: lead.tags,
        project_id: lead.project_id,
        website: null,
        project_name: 'Loading...',
        extra_data: null // Initialize as null, will be properly set below
      };
      
      // Handle extra_data field correctly with improved error handling
      if (lead.extra_data) {
        try {
          if (typeof lead.extra_data === 'string') {
            // If it's a string (possibly from Postgres JSON), parse it
            processedLead.extra_data = JSON.parse(lead.extra_data);
          } else if (typeof lead.extra_data === 'object') {
            // If it's already an object, use it directly
            processedLead.extra_data = lead.extra_data;
          }
        } catch (e) {
          console.warn('Error parsing extra_data:', e);
          processedLead.extra_data = null;
        }
      }
      
      return processedLead;
    });
    
    // Try to fetch project data to add project_name to leads
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
