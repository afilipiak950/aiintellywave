
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { fetchProjectExcelData } from '../excel/excel-data-core';

/**
 * Transforms Excel row data into a Lead object
 */
const transformExcelRowToLead = (row: any, projectId: string): Lead => {
  const rowData = row.row_data as Record<string, any>;
  
  // Extract basic information from row_data with fallbacks for different column naming
  const name = rowData.name || rowData.Name || rowData['Full Name'] || 'Unnamed Lead';
  const email = rowData.email || rowData.Email || rowData['E-Mail'] || null;
  const company = rowData.company || rowData.Company || rowData.Organization || null;
  const position = rowData.position || rowData.Position || rowData.Title || null;
  const phone = rowData.phone || rowData.Phone || rowData['Phone Number'] || null;
  
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
 */
const fetchProjectExcelLeads = async (projectId: string): Promise<Lead[]> => {
  console.log(`Fetching Excel leads for project: ${projectId}`);
  const excelLeads: Lead[] = [];
  
  const { data: excelData } = await fetchProjectExcelData(projectId);
  
  if (excelData && excelData.length > 0) {
    console.log(`Found ${excelData.length} Excel rows for project ${projectId}`);
    
    // Transform excel data to leads format
    excelData.forEach(row => {
      if (row.row_data && typeof row.row_data === 'object') {
        const lead = transformExcelRowToLead(row, projectId);
        excelLeads.push(lead);
      }
    });
  }
  
  return excelLeads;
};

/**
 * Fetches Excel leads data for all projects assigned to a user
 */
const fetchUserProjectsExcelLeads = async (userId: string): Promise<Lead[]> => {
  console.log('Fetching Excel leads for all user projects');
  const excelLeads: Lead[] = [];
  
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
    
    for (const projectId of projectIds) {
      const projectLeads = await fetchProjectExcelLeads(projectId);
      excelLeads.push(...projectLeads);
    }
  }
  
  return excelLeads;
};

/**
 * Main function to fetch leads from Excel data based on options
 */
export const fetchExcelLeadsData = async (options: { 
  projectId?: string; 
  assignedToUser?: boolean;
} = {}): Promise<Lead[]> => {
  try {
    const excelLeads: Lead[] = [];
    
    // Get current user id for assigned leads filtering
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    if (!userId) {
      console.log('No authenticated user found');
      return [];
    }
    
    // Only fetch Excel data if we have a projectId or if filtering by assigned to user
    if (options.projectId && options.projectId !== 'unassigned') {
      const projectLeads = await fetchProjectExcelLeads(options.projectId);
      excelLeads.push(...projectLeads);
    } else if (options.assignedToUser && userId) {
      const userProjectLeads = await fetchUserProjectsExcelLeads(userId);
      excelLeads.push(...userProjectLeads);
    }
    
    console.log(`Returning ${excelLeads.length} Excel leads`);
    return excelLeads;
  } catch (error) {
    console.error('Error fetching excel leads:', error);
    return [];
  }
};
