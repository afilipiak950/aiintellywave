
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchProjectExcelData } from '../excel/excel-data-core';

/**
 * Transforms Excel row data into a Lead object
 * Improved with better type handling and more robust mapping
 */
const transformExcelRowToLead = (row: any, projectId: string): Lead => {
  const rowData = row.row_data as Record<string, any>;
  
  // Use case-insensitive lookups to handle various capitalization conventions
  const findField = (possibleNames: string[]): string | null => {
    for (const name of possibleNames) {
      // Try exact match first
      if (rowData[name] !== undefined) return rowData[name];
      
      // Try case-insensitive match
      const key = Object.keys(rowData).find(k => k.toLowerCase() === name.toLowerCase());
      if (key) return rowData[key];
    }
    return null;
  };
  
  // Extract basic information with improved field detection
  const name = findField(['name', 'Name', 'full_name', 'Full Name', 'fullName']) || 'Unnamed Lead';
  const email = findField(['email', 'Email', 'E-Mail', 'e_mail', 'emailAddress']) || null;
  const company = findField(['company', 'Company', 'Organization', 'CompanyName', 'company_name']) || null;
  const position = findField(['position', 'Position', 'Title', 'JobTitle', 'job_title']) || null;
  const phone = findField(['phone', 'Phone', 'Phone Number', 'PhoneNumber', 'phone_number', 'contact']) || null;
  
  return {
    id: row.id,
    project_id: projectId,
    name,
    company,
    email,
    phone,
    position,
    status: 'new' as Lead['status'],
    notes: null,
    last_contact: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    score: 50,
    tags: null,
    // Include all row_data as an additional property for complete information
    excel_data: rowData
  };
};

/**
 * Fetches and processes Excel data for a specific project
 * Improved error handling and logging
 */
const fetchProjectExcelLeads = async (projectId: string): Promise<Lead[]> => {
  console.log(`Fetching Excel leads for project: ${projectId}`);
  const excelLeads: Lead[] = [];
  
  try {
    const { data: excelData, error } = await fetchProjectExcelData(projectId);
    
    if (error) {
      console.error(`Error fetching Excel data for project ${projectId}:`, error);
      return [];
    }
    
    if (excelData && excelData.length > 0) {
      console.log(`Found ${excelData.length} Excel rows for project ${projectId}`);
      
      // Transform excel data to leads format
      excelData.forEach(row => {
        if (row.row_data && typeof row.row_data === 'object') {
          try {
            const lead = transformExcelRowToLead(row, projectId);
            excelLeads.push(lead);
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
const fetchUserProjectsExcelLeads = async (userId: string): Promise<Lead[]> => {
  console.log('Fetching Excel leads for all user projects');
  const excelLeads: Lead[] = [];
  
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
