
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchLeadsByProjectDirect } from './project-access';

/**
 * Handles fallback data fetching when standard queries fail due to RLS issues
 */
export const handleEmergencyFallback = async (userId: string): Promise<Lead[]> => {
  try {
    console.log('Attempting emergency fallback method...');
    
    // Try to get all projects the user has access to
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(10);
      
    if (projectsError) {
      console.error('Failed to fetch projects in emergency fallback:', projectsError);
      // Return empty result rather than throwing to avoid cascading errors
      return [];
    }
    
    if (!projectsData || projectsData.length === 0) {
      console.log('No projects found in emergency fallback');
      return [];
    }
    
    console.log(`Found ${projectsData.length} projects, attempting direct lead fetch`);
    
    // Try to collect leads from all available projects
    const allLeads: Lead[] = [];
    
    // Try getting leads from each project
    for (const project of projectsData) {
      try {
        const projectLeads = await fetchLeadsByProjectDirect(project.id);
        if (projectLeads && projectLeads.length > 0) {
          console.log(`Successfully fetched ${projectLeads.length} leads from project ${project.id}`);
          allLeads.push(...projectLeads);
        }
      } catch (projError) {
        console.warn(`Failed to fetch leads for project ${project.id}:`, projError);
        // Continue with next project
      }
    }
    
    if (allLeads.length > 0) {
      console.log(`Emergency fallback successful: retrieved ${allLeads.length} leads from all projects`);
      return allLeads;
    }
    
    throw new Error('Could not fetch leads from any projects');
  } catch (error) {
    console.error('Emergency fallback failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch leads using fallback mechanism');
  }
};
