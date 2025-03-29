
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches leads from the project_excel_data table
 */
export const fetchExcelLeadsData = async (options: { 
  projectId?: string; 
  assignedToUser?: boolean;
} = {}) => {
  try {
    const excelLeads: Lead[] = [];
    
    // Get current user id for assigned leads filtering
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Only fetch Excel data if we have a projectId or if filtering by assigned to user
    if (options.projectId && options.projectId !== 'unassigned') {
      console.log('Lead service: Checking project_excel_data for additional leads');
      const { data: excelData, error: excelError } = await supabase
        .from('project_excel_data')
        .select(`
          id,
          project_id,
          row_data,
          row_number,
          projects:project_id (
            id,
            name,
            company_id,
            assigned_to
          )
        `)
        .eq('project_id', options.projectId)
        .order('row_number', { ascending: true });
      
      if (excelError) {
        console.error('Lead service: Error fetching excel data:', excelError);
      } else if (excelData && excelData.length > 0) {
        console.log('Lead service: Found excel data, transforming to leads format', excelData.length);
        
        // Transform excel data to leads format
        excelData.forEach(row => {
          if (row.row_data && typeof row.row_data === 'object') {
            const rowData = row.row_data as Record<string, any>;
            // Extract basic information from row_data
            const name = rowData.name || rowData.Name || rowData['Full Name'] || 'Unnamed Lead';
            const email = rowData.email || rowData.Email || rowData['E-Mail'] || null;
            const company = rowData.company || rowData.Company || rowData.Organization || null;
            const position = rowData.position || rowData.Position || rowData.Title || null;
            const phone = rowData.phone || rowData.Phone || rowData['Phone Number'] || null;
            
            excelLeads.push({
              id: row.id,
              project_id: row.project_id,
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
              project_name: row.projects?.name || 'No Project',
              // Include all row_data as an additional property for complete information
              excel_data: rowData
            });
          }
        });
      }
    } else if (options.assignedToUser && userId) {
      // If we're filtering by assigned user but not by projectId, fetch all excel data from projects assigned to the user
      console.log('Lead service: Checking all project_excel_data for projects assigned to user');
      const { data: userProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('assigned_to', userId);
      
      if (projectsError) {
        console.error('Lead service: Error fetching user projects:', projectsError);
      } else if (userProjects && userProjects.length > 0) {
        const projectIds = userProjects.map(p => p.id);
        console.log('Lead service: Found user projects:', projectIds);
        
        const { data: excelData, error: excelError } = await supabase
          .from('project_excel_data')
          .select(`
            id,
            project_id,
            row_data,
            row_number,
            projects:project_id (
              id,
              name,
              company_id,
              assigned_to
            )
          `)
          .in('project_id', projectIds)
          .order('row_number', { ascending: true });
        
        if (excelError) {
          console.error('Lead service: Error fetching excel data:', excelError);
        } else if (excelData && excelData.length > 0) {
          console.log('Lead service: Found excel data from user projects, count:', excelData.length);
          
          // Transform excel data to leads format
          excelData.forEach(row => {
            if (row.row_data && typeof row.row_data === 'object') {
              const rowData = row.row_data as Record<string, any>;
              const name = rowData.name || rowData.Name || rowData['Full Name'] || 'Unnamed Lead';
              const email = rowData.email || rowData.Email || rowData['E-Mail'] || null;
              const company = rowData.company || rowData.Company || rowData.Organization || null;
              const position = rowData.position || rowData.Position || rowData.Title || null;
              const phone = rowData.phone || rowData.Phone || rowData['Phone Number'] || null;
              
              excelLeads.push({
                id: row.id,
                project_id: row.project_id,
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
                project_name: row.projects?.name || 'No Project',
                excel_data: rowData
              });
            }
          });
        }
      }
    }
    
    return excelLeads;
  } catch (error) {
    console.error('Lead service: Error fetching excel leads:', error);
    return [];
  }
};
