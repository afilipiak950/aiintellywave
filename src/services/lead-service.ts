
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';

/**
 * Fetches leads from the database with optional filtering
 */
export const fetchLeadsData = async (options: { 
  projectId?: string; 
  status?: Lead['status'];
  assignedToUser?: boolean;
} = {}) => {
  try {
    console.log('Lead service: Fetching leads with options:', options);
    
    // Get current user id for assigned leads filtering
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Build a query that resolves the ambiguous column issue
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
        projects:project_id (
          id,
          name,
          company_id,
          assigned_to
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (options.projectId) {
      console.log('Lead service: Filtering by project_id:', options.projectId);
      // Handle the special case for "unassigned" leads
      if (options.projectId === 'unassigned') {
        query = query.is('project_id', null);
      } else {
        query = query.eq('project_id', options.projectId);
      }
    }
    
    if (options.status) {
      console.log('Lead service: Filtering by status:', options.status);
      query = query.eq('status', options.status);
    }

    // If assignedToUser is true, filter by projects assigned to the current user
    if (options.assignedToUser && userId) {
      console.log('Lead service: Filtering by projects assigned to user:', userId);
      // We need to join with projects to filter by assigned_to
      query = query.filter('projects.assigned_to', 'eq', userId);
    }
    
    console.log('Lead service: Executing Supabase query');
    const { data: leadsData, error: leadsError } = await query;
    
    if (leadsError) {
      console.error('Lead service: Error in Supabase query:', leadsError);
      throw leadsError;
    }
    
    // Now also fetch data from project_excel_data if we have a projectId
    let excelLeads: Lead[] = [];
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
        excelLeads = excelData.map(row => {
          // Extract basic information from row_data
          const name = row.row_data?.name || row.row_data?.Name || row.row_data?.['Full Name'] || 'Unnamed Lead';
          const email = row.row_data?.email || row.row_data?.Email || row.row_data?.['E-Mail'] || null;
          const company = row.row_data?.company || row.row_data?.Company || row.row_data?.Organization || null;
          const position = row.row_data?.position || row.row_data?.Position || row.row_data?.Title || null;
          const phone = row.row_data?.phone || row.row_data?.Phone || row.row_data?.['Phone Number'] || null;
          
          return {
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
            excel_data: row.row_data
          };
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
          
          // Transform excel data to leads format (same as above)
          excelLeads = excelData.map(row => {
            const name = row.row_data?.name || row.row_data?.Name || row.row_data?.['Full Name'] || 'Unnamed Lead';
            const email = row.row_data?.email || row.row_data?.Email || row.row_data?.['E-Mail'] || null;
            const company = row.row_data?.company || row.row_data?.Company || row.row_data?.Organization || null;
            const position = row.row_data?.position || row.row_data?.Position || row.row_data?.Title || null;
            const phone = row.row_data?.phone || row.row_data?.Phone || row.row_data?.['Phone Number'] || null;
            
            return {
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
              excel_data: row.row_data
            };
          });
        }
      }
    }
    
    // Combine regular leads with excel leads
    console.log('Lead service: Regular leads count:', leadsData?.length || 0);
    console.log('Lead service: Excel leads count:', excelLeads.length);
    
    const combinedLeads = [...(leadsData || []), ...excelLeads];
    console.log('Lead service: Combined leads count:', combinedLeads.length);
    
    if (combinedLeads.length > 0) {
      const formattedLeads = combinedLeads.map(lead => ({
        ...lead,
        project_name: lead.project_name || lead.projects?.name || 'No Project',
      }));
      
      console.log('Lead service: Formatted leads count:', formattedLeads.length);
      return formattedLeads;
    } else {
      console.log('Lead service: No leads found in database');
      return [];
    }
  } catch (error) {
    console.error('Lead service: Error fetching leads:', error);
    toast({
      title: 'Error',
      description: 'Failed to load leads data. Please try again.',
      variant: 'destructive'
    });
    return [];
  }
};

/**
 * Creates a new lead in the database
 */
export const createLeadData = async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('Lead service: Creating new lead:', lead);
    
    // Ensure lead has required fields
    if (!lead.name) {
      throw new Error('Lead name is required');
    }
    
    // Set default status if not provided
    if (!lead.status) {
      lead.status = 'new';
    }
    
    // Add timestamps for consistency
    const now = new Date().toISOString();
    
    // Add more detailed logging to track the insert operation
    console.log('Lead service: Sending insert request to Supabase');
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...lead,
        created_at: now,
        updated_at: now
      })
      .select();
    
    if (error) {
      console.error('Lead service: Error in Supabase insert:', error);
      toast({
        title: 'Error',
        description: `Failed to create lead: ${error.message}`,
        variant: 'destructive'
      });
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Lead service: Successfully created lead:', data[0]);
      toast({
        title: 'Success',
        description: 'Lead created successfully',
      });
      return data[0];
    } else {
      console.log('Lead service: No data returned after insert');
      toast({
        title: 'Warning',
        description: 'Lead may have been created but no data was returned',
      });
      return null;
    }
  } catch (error) {
    console.error('Lead service: Error creating lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to create lead. Please try again.',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Updates an existing lead in the database
 */
export const updateLeadData = async (id: string, updates: Partial<Lead>) => {
  try {
    console.log('Lead service: Updating lead:', id, updates);
    
    const { data, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Lead service: Error in Supabase update:', error);
      throw error;
    }
    
    if (data) {
      console.log('Lead service: Successfully updated lead:', data);
      toast({
        title: 'Success',
        description: 'Lead updated successfully',
      });
      return data;
    } else {
      console.log('Lead service: No data returned after update');
      return null;
    }
  } catch (error) {
    console.error('Lead service: Error updating lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to update lead. Please try again.',
      variant: 'destructive'
    });
    return null;
  }
};

/**
 * Deletes a lead from the database
 */
export const deleteLeadData = async (id: string) => {
  try {
    console.log('Lead service: Deleting lead:', id);
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Lead service: Error in Supabase delete:', error);
      throw error;
    }
    
    console.log('Lead service: Successfully deleted lead:', id);
    toast({
      title: 'Success',
      description: 'Lead deleted successfully',
    });
    return true;
  } catch (error) {
    console.error('Lead service: Error deleting lead:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete lead. Please try again.',
      variant: 'destructive'
    });
    return false;
  }
};
