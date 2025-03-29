
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchProjectExcelLeads, fetchUserProjectsExcelLeads } from '../excel/excel-lead-fetch';

/**
 * Main function to fetch leads from Excel data based on options
 * Improved error handling, logging, and option validation
 */
export const fetchExcelLeadsData = async (options: { 
  projectId?: string; 
  assignedToUser?: boolean;
} = {}): Promise<Lead[]> => {
  try {
    console.log('fetchExcelLeadsData called with options:', options);
    const excelLeads: Lead[] = [];
    
    // Get current user id for assigned leads filtering
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return [];
    }
    
    const userId = user?.id;
    
    if (!userId) {
      console.log('No authenticated user found');
      return [];
    }
    
    // Validate projectId
    if (options.projectId) {
      if (typeof options.projectId !== 'string') {
        console.error('Invalid projectId provided:', options.projectId);
        return [];
      }
      
      if (options.projectId === 'unassigned') {
        console.log('Skipping Excel fetch for unassigned leads');
        return [];
      }
    }
    
    // Only fetch Excel data if we have a projectId or if filtering by assigned to user
    if (options.projectId) {
      const projectLeads = await fetchProjectExcelLeads(options.projectId);
      excelLeads.push(...projectLeads);
    } else if (options.assignedToUser && userId) {
      const userProjectLeads = await fetchUserProjectsExcelLeads(userId);
      excelLeads.push(...userProjectLeads);
    } else {
      console.log('No specific fetch criteria provided, skipping Excel leads fetch');
    }
    
    console.log(`Returning ${excelLeads.length} Excel leads`);
    return excelLeads;
  } catch (error) {
    console.error('Error fetching excel leads:', error);
    return [];
  }
};
