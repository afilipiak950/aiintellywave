
import { supabase } from '@/integrations/supabase/client';

// Add this function if it doesn't exist, or update it if it does
export const updateApprovalStatus = async (rowId: string, status: string | null) => {
  try {
    console.log(`Updating approval status for row ${rowId} to ${status}`);
    const { data, error } = await supabase
      .from('project_excel_data')
      .update({ approval_status: status })
      .eq('id', rowId)
      .select();
    
    if (error) {
      console.error('Error updating approval status:', error);
      throw error;
    }
    
    console.log('Approval status updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateApprovalStatus:', error);
    throw error;
  }
};

export const fetchLeadsWithApprovalStatus = async (projectId: string) => {
  try {
    console.log(`Fetching leads with approval status for project ${projectId}`);
    const { data, error } = await supabase
      .from('project_excel_data')
      .select('id, approval_status')
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error fetching leads with approval status:', error);
      throw error;
    }
    
    console.log(`Found ${data.length} leads with approval status information`);
    return data || [];
  } catch (error) {
    console.error('Error in fetchLeadsWithApprovalStatus:', error);
    return [];
  }
};

// Add the missing core functions
export const fetchProjectExcelData = async (projectId: string) => {
  try {
    console.log(`Fetching excel data for project ${projectId}`);
    const { data, error } = await supabase
      .from('project_excel_data')
      .select('*')
      .eq('project_id', projectId)
      .order('row_number', { ascending: true });
    
    if (error) {
      console.error('Error fetching project excel data:', error);
      throw error;
    }
    
    // Extract columns from the first row if data exists
    const columns = data && data.length > 0 
      ? Object.keys(data[0].row_data || {})
      : [];
    
    console.log(`Found ${data.length} rows with ${columns.length} columns`);
    return { 
      data: data || [], 
      columns 
    };
  } catch (error) {
    console.error('Error in fetchProjectExcelData:', error);
    throw error;
  }
};

export const updateExcelCellData = async (rowId: string, column: string, value: string) => {
  try {
    console.log(`Updating cell data for row ${rowId}, column ${column}`);
    const { data: existingData, error: fetchError } = await supabase
      .from('project_excel_data')
      .select('row_data')
      .eq('id', rowId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching existing row data:', fetchError);
      throw fetchError;
    }
    
    // Update the specific column in row_data
    const updatedRowData = {
      ...existingData.row_data,
      [column]: value
    };
    
    // Update the record
    const { data, error } = await supabase
      .from('project_excel_data')
      .update({ 
        row_data: updatedRowData,
        updated_at: new Date().toISOString()
      })
      .eq('id', rowId)
      .select();
    
    if (error) {
      console.error('Error updating cell data:', error);
      throw error;
    }
    
    console.log('Cell data updated successfully');
    return data;
  } catch (error) {
    console.error('Error in updateExcelCellData:', error);
    throw error;
  }
};

export const deleteProjectExcelData = async (projectId: string) => {
  try {
    console.log(`Deleting all excel data for project ${projectId}`);
    const { error } = await supabase
      .from('project_excel_data')
      .delete()
      .eq('project_id', projectId);
    
    if (error) {
      console.error('Error deleting project excel data:', error);
      throw error;
    }
    
    console.log('Project excel data deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteProjectExcelData:', error);
    throw error;
  }
};
