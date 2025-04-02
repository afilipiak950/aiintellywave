
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';
import { transformExcelRowToLead } from './excel-lead-transform';
import { getAuthUser } from '@/utils/auth-utils';

/**
 * Processes Excel file data and inserts it into the database
 * Enhanced with improved error reporting, user authentication verification,
 * and dynamic field mapping
 */
export const processExcelFile = async (file: File, projectId: string): Promise<any> => {
  try {
    console.log(`Processing Excel file for project: ${projectId}`);
    
    // Verify authentication first
    const user = await getAuthUser();
    if (!user) {
      console.error('Authentication required for Excel processing');
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
    
    // Use the special RPC function to bypass RLS
    // Process each batch using RPC function
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1} of ${batches.length} with ${batch.length} leads`);
      
      try {
        // Use RPC to bypass RLS - this function must be created in the database
        const { data: insertedLeads, error } = await supabase.rpc(
          'insert_leads_admin',
          { 
            leads_data: JSON.stringify(batch),
            project: projectId
          }
        );
        
        if (error) {
          console.error(`Error inserting batch ${i+1}:`, error);
          // Try direct insert as fallback - may work for admin users or with proper permissions
          const { data: directInsertLeads, error: directError } = await supabase
            .from('leads')
            .insert(batch)
            .select('id');
            
          if (directError) {
            console.error(`Direct insert also failed for batch ${i+1}:`, directError);
          } else {
            console.log(`Successfully inserted batch ${i+1} with ${directInsertLeads?.length || 0} leads via direct insert`);
            if (directInsertLeads) {
              allInsertedLeads = [...allInsertedLeads, ...directInsertLeads];
            }
          }
        } else {
          console.log(`Successfully inserted batch ${i+1} with ${insertedLeads?.length || 0} leads via RPC`);
          if (insertedLeads) {
            allInsertedLeads = [...allInsertedLeads, ...insertedLeads];
          }
        }
      } catch (batchError) {
        console.error(`Batch processing error for batch ${i+1}:`, batchError);
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
      
      // Process each batch using RPC function to bypass RLS
      for (let i = 0; i < excelBatches.length; i++) {
        const batch = excelBatches[i];
        console.log(`Processing Excel data batch ${i+1} of ${excelBatches.length}`);
        
        try {
          // Try RPC first
          const { data, error } = await supabase.rpc(
            'insert_excel_data_admin',
            { 
              excel_rows: JSON.stringify(batch),
              project: projectId
            }
          );
          
          if (error) {
            console.error(`Error inserting Excel data batch ${i+1} via RPC:`, error);
            // Fallback to direct insert
            const { error: directError } = await supabase
              .from('project_excel_data')
              .insert(batch);
              
            if (directError) {
              console.error(`Direct insert also failed for Excel data batch ${i+1}:`, directError);
            } else {
              console.log(`Successfully inserted Excel data batch ${i+1} via direct insert`);
            }
          } else {
            console.log(`Successfully inserted Excel data batch ${i+1} via RPC`);
          }
        } catch (batchError) {
          console.error(`Batch processing error for Excel data batch ${i+1}:`, batchError);
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
    
    // Try to use RPC to bypass RLS
    const { error: rpcError } = await supabase.rpc(
      'delete_excel_data_admin',
      { project: projectId }
    );
    
    if (rpcError) {
      console.error('Error deleting via RPC, trying direct delete:', rpcError);
      // Fallback to direct delete
      const { error } = await supabase
        .from('project_excel_data')
        .delete()
        .eq('project_id', projectId);
        
      if (error) {
        console.error('Error deleting existing Excel data via direct delete:', error);
        throw error;
      }
    }
    
    console.log('Successfully deleted existing Excel data for project:', projectId);
  } catch (error) {
    console.error('Error deleting existing Excel data:', error);
    throw error;
  }
};
