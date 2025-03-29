
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchProjectExcelData } from './excel-data-core';
import { transformExcelRowToLead } from './excel-lead-transform';

/**
 * Fetches and processes Excel data for a specific project
 * Improved error handling and logging
 */
export const fetchProjectExcelLeads = async (projectId: string): Promise<Partial<Lead>[]> => {
  console.log(`Fetching Excel leads for project: ${projectId}`);
  const excelLeads: Partial<Lead>[] = []; // Changed from Lead[] to Partial<Lead>[]
  
  try {
    const { data: excelData, columns } = await fetchProjectExcelData(projectId);
    
    if (excelData && excelData.length > 0) {
      console.log(`Found ${excelData.length} Excel rows for project ${projectId}`);
      
      // Transform excel data to leads format
      excelData.forEach(row => {
        if (row.row_data && typeof row.row_data === 'object') {
          try {
            const lead = transformExcelRowToLead(row.row_data, projectId);
            excelLeads.push(lead); // This is now properly typed as Partial<Lead>
          } catch (transformError) {
            console.error(`Error transforming Excel row ${row.id}:`, transformError);
            // Continue with other rows instead of failing completely
          }
        } else {
          console.warn(`Skipping row ${row.id} - invalid row_data:`, row.row_data);
        }
      });
      
      console.log(`Transformed ${excelLeads.length} leads from Excel data`);
    } else {
      console.log(`No Excel data found for project ${projectId}`);
    }
    
    return excelLeads;
  } catch (error) {
    console.error(`Error in fetchProjectExcelLeads for project ${projectId}:`, error);
    return [];
  }
};

/**
 * Fetches Excel leads data for all projects assigned to a user
 * Improved error handling and logging
 */
export const fetchUserProjectsExcelLeads = async (userId: string): Promise<Partial<Lead>[]> => {
  console.log('Fetching Excel leads for all user projects');
  const excelLeads: Partial<Lead>[] = []; // Changed from Lead[] to Partial<Lead>[]
  
  try {
    const { data: userProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('assigned_to', userId);
    
    if (projectsError) {
      console.error('Error fetching user projects:', projectsError);
      return [];
    }
    
    if (userProjects && userProjects.length > 0) {
      const projectIds = userProjects.map(p => p.id);
      console.log('Found user projects:', projectIds);
      
      // Process projects in parallel for better performance
      const projectLeadsPromises = projectIds.map(projectId => fetchProjectExcelLeads(projectId));
      const projectLeadsResults = await Promise.all(projectLeadsPromises);
      
      // Combine all project results
      projectLeadsResults.forEach(projectLeads => {
        excelLeads.push(...projectLeads);
      });
      
      console.log(`Fetched ${excelLeads.length} total Excel leads from ${userProjects.length} projects`);
    } else {
      console.log('No projects found for user:', userId);
    }
    
    return excelLeads;
  } catch (error) {
    console.error('Error in fetchUserProjectsExcelLeads:', error);
    return [];
  }
};
