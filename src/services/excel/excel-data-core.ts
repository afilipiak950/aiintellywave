
import { supabase } from '../../integrations/supabase/client';
import { ExcelRow } from '../../types/project';

// Fetch Excel data for a specific project
export const fetchProjectExcelData = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_excel_data')
    .select('*')
    .eq('project_id', projectId)
    .order('row_number', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // Transform data to proper format if needed
  // Explicitly cast the returned data to match ExcelRow type
  const rows: ExcelRow[] = (data || []).map(item => ({
    id: item.id,
    row_number: item.row_number,
    row_data: item.row_data as Record<string, any>, // Force the type here
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Include approval_status in the returned data
    approval_status: item.approval_status
  }));
  
  // Extract all unique column names from the data
  const columnSet = new Set<string>();
  rows.forEach(row => {
    if (row.row_data) {
      Object.keys(row.row_data).forEach(key => columnSet.add(key));
    }
  });
  
  // Convert the Set to an array
  const columns = Array.from(columnSet);
  
  return { data: rows, columns };
};

// Update cell data for a specific row and column
export const updateExcelCellData = async (rowId: string, column: string, value: string) => {
  // Get the current row data
  const { data: rowData, error: fetchError } = await supabase
    .from('project_excel_data')
    .select('row_data')
    .eq('id', rowId)
    .single();
  
  if (fetchError) {
    throw fetchError;
  }
  
  // Ensure rowData.row_data is an object before spreading
  const currentRowData = rowData.row_data || {};
  
  // Update the specific column in the row_data
  const updatedRowData = {
    ...currentRowData,
    [column]: value
  };
  
  // Save the updated row_data
  const { error: updateError } = await supabase
    .from('project_excel_data')
    .update({ row_data: updatedRowData })
    .eq('id', rowId);
  
  if (updateError) {
    throw updateError;
  }
};

// Delete all Excel data for a specific project
export const deleteProjectExcelData = async (projectId: string) => {
  const { error } = await supabase
    .from('project_excel_data')
    .delete()
    .eq('project_id', projectId);
  
  if (error) {
    throw error;
  }
};

// Update lead approval status
export const updateApprovalStatus = async (rowId: string, status: 'approved' | 'declined' | null) => {
  const { error } = await supabase
    .from('project_excel_data')
    .update({ approval_status: status })
    .eq('id', rowId);
  
  if (error) {
    throw error;
  }
};

// Fetch leads with approval status
export const fetchLeadsWithApprovalStatus = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_excel_data')
    .select('id, approval_status')
    .eq('project_id', projectId);
  
  if (error) {
    throw error;
  }
  
  return data || [];
};
