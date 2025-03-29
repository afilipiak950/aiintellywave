
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';

/**
 * Processes Excel file data and inserts it into the database
 * Improved with enhanced error handling and validation
 */
export const processExcelFile = async (file: File, projectId: string): Promise<any> => {
  try {
    console.log(`Processing Excel file for project: ${projectId}`);
    
    // Parse the Excel file into JSON data
    const { jsonData, columns } = await parseExcelFile(file);
    console.log(`Parsed Excel file with ${jsonData.length} rows and ${columns.length} columns`);
    
    if (jsonData.length === 0) {
      console.warn('No data found in Excel file');
      return [];
    }
    
    // Step 1: Insert leads into the leads table with better field mapping
    const leadsToInsert: Omit<Lead, 'id' | 'created_at' | 'updated_at'>[] = jsonData.map((row, index) => {
      const rowObject = row as Record<string, any>;
      
      // Helper function to find a field value with multiple possible column names
      const findField = (possibleNames: string[]): string | null => {
        for (const name of possibleNames) {
          if (rowObject[name] !== undefined) return rowObject[name];
          // Try case-insensitive match
          const key = Object.keys(rowObject).find(k => k.toLowerCase() === name.toLowerCase());
          if (key) return rowObject[key];
        }
        return null;
      };
      
      // Extract lead data with comprehensive field matching
      const name = findField(['Name', 'name', 'Full Name', 'FullName', 'full_name']) || `Lead ${index + 1}`;
      const company = findField(['Company', 'company', 'Organization', 'CompanyName', 'company_name']) || null;
      const email = findField(['Email', 'email', 'E-Mail', 'EmailAddress', 'email_address']) || null;
      const phone = findField(['Phone', 'phone', 'Phone Number', 'PhoneNumber', 'phone_number']) || null;
      const position = findField(['Position', 'position', 'Title', 'JobTitle', 'job_title']) || null;
      
      // Validate required fields
      if (!name) {
        console.warn(`Row ${index} is missing a name, using default`);
      }
      
      // Create a notes string from the row data
      let notes: string;
      try {
        notes = JSON.stringify(row);
      } catch (error) {
        console.error(`Error stringifying row ${index}:`, error);
        notes = `Error processing data for lead ${index + 1}`;
      }
      
      return {
        name,
        company,
        email,
        phone,
        position,
        status: 'new',
        notes,
        project_id: projectId,
        score: 0,
        tags: columns,
        last_contact: null
      };
    });
    
    console.log('Preparing to insert leads into leads table:', leadsToInsert.length);
    
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
        .select();
      
      if (leadsInsertError) {
        console.error(`Error inserting batch ${i+1}:`, leadsInsertError);
        // Continue with next batch instead of failing completely
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
          // Continue with next batch
        } else {
          console.log(`Successfully inserted Excel data batch ${i+1}`);
        }
      }
      
      console.log('Completed Excel data insertion');
    } catch (excelError) {
      console.error('Error handling Excel data storage:', excelError);
      // Don't throw here, we want to return the inserted leads even if Excel storage fails
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
