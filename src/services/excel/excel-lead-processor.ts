
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';
import { transformExcelRowToLead } from './excel-lead-transform';

/**
 * Processes Excel file data and inserts it into the database
 * Enhanced with improved error reporting, user authentication verification,
 * and dynamic field mapping
 */
export const processExcelFile = async (file: File, projectId: string): Promise<any> => {
  try {
    console.log(`Processing Excel file for project: ${projectId}`);
    
    // Verify authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication required for Excel processing:', authError);
      throw new Error('Authentication required: Please log in to process Excel files');
    }
    
    console.log(`Authenticated as user: ${user.id}`);
    
    // Parse the Excel file into JSON data
    const { jsonData, columns } = await parseExcelFile(file);
    console.log(`Parsed Excel file with ${jsonData.length} rows and ${columns.length} columns`);
    
    if (jsonData.length === 0) {
      console.warn('No data found in Excel file');
      return [];
    }
    
    // Step 1: Transform Excel rows to leads with proper field mapping
    const leadsToInsert: Partial<Lead>[] = jsonData.map((row) => {
      return transformExcelRowToLead(row as Record<string, any>, projectId);
    });
    
    console.log('Preparing to insert leads with dynamic mapping:', leadsToInsert.length);
    console.log('Sample lead with mapping:', leadsToInsert[0]);
    
    // Split inserts into batches to avoid payload size limits
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      batches.push(leadsToInsert.slice(i, i + batchSize));
    }
    
    console.log(`Splitting ${leadsToInsert.length} leads into ${batches.length} batches`);
    
    let allInsertedLeads: any[] = [];
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1} of ${batches.length} with ${batch.length} leads`);
      
      const { data: insertedLeads, error: leadsInsertError } = await supabase
        .from('leads')
        .insert(batch)
        .select('id');
      
      if (leadsInsertError) {
        console.error(`Error inserting batch ${i+1}:`, leadsInsertError);
      } else {
        console.log(`Successfully inserted batch ${i+1} with ${insertedLeads?.length || 0} leads`);
        if (insertedLeads) {
          allInsertedLeads = [...allInsertedLeads, ...insertedLeads];
        }
      }
    }
    
    console.log(`Total leads successfully inserted: ${allInsertedLeads.length} of ${leadsToInsert.length}`);
    
    // Step 2: Store the original Excel data in project_excel_data for display
    try {
      await deleteExistingExcelData(projectId);
      console.log('Successfully deleted existing Excel data for project');
      
      // Prepare rows to insert
      const rowsToInsert = jsonData.map((row, index) => ({
        project_id: projectId,
        row_number: index + 1,
        row_data: row as Json,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      console.log(`Inserting ${rowsToInsert.length} rows of Excel data into project_excel_data table`);
      
      // Split into batches for excel data too
      const excelBatches = [];
      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        excelBatches.push(rowsToInsert.slice(i, i + batchSize));
      }
      
      // Process each batch
      for (let i = 0; i < excelBatches.length; i++) {
        const batch = excelBatches[i];
        console.log(`Processing Excel data batch ${i+1} of ${excelBatches.length}`);
        
        const { error } = await supabase
          .from('project_excel_data')
          .insert(batch);
          
        if (error) {
          console.error(`Error inserting Excel data batch ${i+1}:`, error);
        } else {
          console.log(`Successfully inserted Excel data batch ${i+1}`);
        }
      }
      
      console.log('Completed Excel data insertion');
    } catch (excelError) {
      console.error('Error handling Excel data storage:', excelError);
    }
    
    return allInsertedLeads;
  } catch (error) {
    console.error('Critical error processing Excel:', error);
    throw error;
  }
};

/**
 * Deletes existing Excel data for a project
 * Private helper function
 */
const deleteExistingExcelData = async (projectId: string): Promise<void> => {
  try {
    console.log(`Deleting existing Excel data for project: ${projectId}`);
    
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
