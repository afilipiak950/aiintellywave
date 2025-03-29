
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';

/**
 * Processes Excel file data and inserts it into the database
 */
export const processExcelFile = async (file: File, projectId: string): Promise<any> => {
  try {
    const { jsonData, columns } = await parseExcelFile(file);
    
    // Step 1: Insert leads into the leads table
    const leadsToInsert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = jsonData.map((row, index) => {
      const rowObject = row as Record<string, any>;
      return {
        name: rowObject['Name'] || rowObject['name'] || `Lead ${index + 1}`,
        company: rowObject['Company'] || rowObject['company'] || null,
        email: rowObject['Email'] || rowObject['email'] || null,
        phone: rowObject['Phone'] || rowObject['phone'] || null,
        position: rowObject['Position'] || rowObject['position'] || null,
        status: 'new',
        notes: JSON.stringify(row),
        project_id: projectId,
        score: 0,
        tags: columns,
        last_contact: null
      };
    });
    
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
    await deleteExistingExcelData(projectId);
    
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
 * Deletes existing Excel data for a project
 * Private helper function
 */
const deleteExistingExcelData = async (projectId: string): Promise<void> => {
  try {
    // Delete existing Excel data for this project
    const { error } = await supabase
      .from('project_excel_data')
      .delete()
      .eq('project_id', projectId);
      
    if (error) {
      console.error('Error deleting existing Excel data:', error);
      throw error;
    }
    
    console.log('Successfully deleted existing Excel data for project:', projectId);
  } catch (error) {
    console.error('Error deleting existing Excel data:', error);
    throw error;
  }
};
