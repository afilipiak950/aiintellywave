
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchLeadsByProjectDirect } from './project-access';

export const handleEmergencyFallback = async (userId: string): Promise<Lead[]> => {
  try {
    console.log('Attempting emergency fallback method...');
    
    // Try to get company ID directly
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Not authenticated');
    
    // Get all leads from all projects the user might have access to
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name')
      .limit(10);
      
    if (!projectsData || projectsData.length === 0) {
      console.log('No projects found in emergency fallback');
      throw new Error('No projects found. Please check your permissions.');
    }
    
    console.log(`Found ${projectsData.length} projects, attempting direct lead fetch`);
    
    // Try getting leads from the first few projects
    for (const project of projectsData) {
      try {
        const projectLeads = await fetchLeadsByProjectDirect(project.id);
        if (projectLeads && projectLeads.length > 0) {
          console.log(`Successfully fetched ${projectLeads.length} leads from project ${project.id}`);
          return projectLeads;
        }
      } catch (projError) {
        console.warn(`Failed to fetch leads for project ${project.id}:`, projError);
      }
    }
    
    throw new Error('Could not fetch leads from any projects');
  } catch (error) {
    console.error('Emergency fallback failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to fetch leads using fallback mechanism');
  }
};
