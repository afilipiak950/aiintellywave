
import { supabase } from '../../integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { ExcelRow, ProjectExcelRow } from '@/types/project';

/**
 * Core functions for fetching Excel data
 */
export const fetchProjectExcelData = async (projectId: string): Promise<{
  data: ExcelRow[],
  columns: string[]
}> => {
  try {
    const { data, error } = await supabase
      .from('project_excel_data')
      .select('*')
      .eq('project_id', projectId)
      .order('row_number', { ascending: true });
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      const firstRowColumns = Object.keys(data[0].row_data || {});
      
      const typedData: ExcelRow[] = data.map((item: ProjectExcelRow) => ({
        id: item.id,
        row_number: item.row_number,
        row_data: item.row_data || {},
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      return {
        data: typedData,
        columns: firstRowColumns
      };
    }
    
    return {
      data: [],
      columns: []
    };
  } catch (error) {
    console.error('Error fetching excel data:', error);
    throw error;
  }
};

/**
 * Updates a specific cell in the Excel data
 */
export const updateExcelCellData = async (rowId: string, column: string, value: string): Promise<void> => {
  try {
    // First, get the current row_data
    const { data: rowData, error: fetchError } = await supabase
      .from('project_excel_data')
      .select('row_data')
      .eq('id', rowId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!rowData || !rowData.row_data) {
      throw new Error('Row data not found');
    }
    
    // Create a new object with updated column
    const updatedRowData = {
      ...rowData.row_data as Record<string, any>,
      [column]: value
    };
    
    const { error } = await supabase
      .from('project_excel_data')
      .update({
        row_data: updatedRowData,
        updated_at: new Date().toISOString()
      })
      .eq('id', rowId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating cell:', error);
    throw error;
  }
};

/**
 * Deletes all Excel data for a specific project
 */
export const deleteProjectExcelData = async (projectId: string): Promise<void> => {
  try {
    // First, delete leads associated with this project
    const { error: leadsDeleteError } = await supabase
      .from('leads')
      .delete()
      .eq('project_id', projectId);
      
    if (leadsDeleteError) {
      console.error('Error deleting leads:', leadsDeleteError);
      throw leadsDeleteError;
    }
    
    console.log('Successfully deleted leads for project:', projectId);
    
    // Then delete the Excel data
    const { error } = await supabase
      .from('project_excel_data')
      .delete()
      .eq('project_id', projectId);
      
    if (error) throw error;
    
    console.log('Successfully deleted Excel data for project:', projectId);
  } catch (error) {
    console.error('Error deleting Excel data:', error);
    throw error;
  }
};
