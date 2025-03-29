
import { supabase } from '../integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Lead } from '@/types/lead';
import { ExcelRow, ProjectExcelRow } from '@/types/project';
import { Json } from '@/integrations/supabase/types';
import * as XLSX from 'xlsx';

/**
 * Fetches Excel data for a specific project
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
 * Processes Excel file data and inserts it into the database
 */
export const processExcelFile = async (file: File, projectId: string): Promise<any> => {
  try {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      throw new Error('Please upload an Excel or CSV file');
    }
    
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      throw new Error('The Excel file does not contain any data');
    }
    
    const cols = Object.keys(jsonData[0] as object);
    
    // Step 1: Insert leads into the leads table
    const leadsToInsert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = jsonData.map((row, index) => ({
      name: row['Name'] || row['name'] || `Lead ${index + 1}`,
      company: row['Company'] || row['company'] || null,
      email: row['Email'] || row['email'] || null,
      phone: row['Phone'] || row['phone'] || null,
      position: row['Position'] || row['position'] || null,
      status: 'new',
      notes: JSON.stringify(row),
      project_id: projectId,
      score: 0,
      tags: cols,
      last_contact: null
    }));
    
    console.log('Inserting leads into leads table:', leadsToInsert.length);
    
    const { data: insertedLeads, error: leadsInsertError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();
    
    if (leadsInsertError) {
      console.error('Error inserting leads:', leadsInsertError);
      throw leadsInsertError;
    }
    
    console.log('Successfully inserted leads:', insertedLeads?.length || 0);
    
    // Step 2: Store the original Excel data in project_excel_data for display
    await deleteProjectExcelData(projectId);
    
    const rowsToInsert = jsonData.map((row, index) => ({
      project_id: projectId,
      row_number: index + 1,
      row_data: row as Json,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    console.log('Inserting Excel data into project_excel_data table:', rowsToInsert.length);
    
    const { error } = await supabase
      .from('project_excel_data')
      .insert(rowsToInsert);
      
    if (error) throw error;
    
    console.log('Successfully inserted Excel data');
    
    return insertedLeads;
  } catch (error) {
    console.error('Error processing Excel:', error);
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
    
    const updatedRowData = {
      ...rowData.row_data,
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
 * Exports Excel data to an XLSX file
 */
export const exportExcelData = (data: ExcelRow[], filename: string): void => {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }
    
    const dataForExport = data.map(row => row.row_data);
    
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw error;
  }
};
