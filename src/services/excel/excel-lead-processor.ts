
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';
import { transformExcelRowToLead } from './excel-lead-transform';
import { getAuthUser } from '@/utils/auth-utils';
import { toast } from '@/hooks/use-toast';

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
    
    // Process each batch with direct insert instead of RPC
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1} of ${batches.length} with ${batch.length} leads`);
      
      try {
        // Direct insert into the leads table
        const { data: insertedLeads, error } = await supabase
          .from('leads')
          .insert(batch)
          .select('id');
          
        if (error) {
          console.error(`Error inserting batch ${i+1}:`, error);
          
          // If direct insert fails, try with individual inserts to bypass potential issues
          let individualInsertCount = 0;
          for (const lead of batch) {
            try {
              const { data: individualInsert, error: individualError } = await supabase
                .from('leads')
                .insert(lead)
                .select('id');
                
              if (!individualError && individualInsert) {
                individualInsertCount++;
                if (Array.isArray(individualInsert)) {
                  allInsertedLeads = [...allInsertedLeads, ...individualInsert];
                } else if (individualInsert) {
                  allInsertedLeads.push(individualInsert);
                }
              } else {
                console.error(`Individual insert error:`, individualError);
              }
            } catch (err) {
              console.error(`Exception on individual insert:`, err);
            }
          }
          
          if (individualInsertCount > 0) {
            console.log(`Successfully inserted ${individualInsertCount} leads via individual inserts`);
          }
        } else {
          console.log(`Successfully inserted batch ${i+1} with ${insertedLeads ? (Array.isArray(insertedLeads) ? insertedLeads.length : 1) : 0} leads`);
          
          // Add proper type guard for array handling
          if (insertedLeads) {
            if (Array.isArray(insertedLeads)) {
              allInsertedLeads = [...allInsertedLeads, ...insertedLeads];
            } else {
              // Handle case where it might be a single object
              allInsertedLeads.push(insertedLeads);
            }
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
      
      let totalInsertedExcelRows = 0;
      
      // Process each batch using direct insert instead of RPC
      for (let i = 0; i < excelBatches.length; i++) {
        const batch = excelBatches[i];
        console.log(`Processing Excel data batch ${i+1} of ${excelBatches.length}`);
        
        try {
          // Direct insert into project_excel_data table
          const { data, error } = await supabase
            .from('project_excel_data')
            .insert(batch);
            
          if (error) {
            console.error(`Error inserting Excel data batch ${i+1}:`, error);
            
            // If batch insert fails, try with individual inserts
            let individualInsertCount = 0;
            for (const excelRow of batch) {
              try {
                const { error: individualError } = await supabase
                  .from('project_excel_data')
                  .insert(excelRow);
                  
                if (!individualError) {
                  individualInsertCount++;
                  totalInsertedExcelRows++;
                }
              } catch (err) {
                console.error(`Exception on individual Excel row insert:`, err);
              }
            }
            
            if (individualInsertCount > 0) {
              console.log(`Successfully inserted ${individualInsertCount} Excel rows via individual inserts`);
            }
          } else {
            console.log(`Successfully inserted Excel data batch ${i+1}`);
            totalInsertedExcelRows += batch.length;
          }
        } catch (batchError) {
          console.error(`Batch processing error for Excel data batch ${i+1}:`, batchError);
        }
      }
      
      console.log(`Completed Excel data insertion. Total rows inserted: ${totalInsertedExcelRows}`);
      
      // If we couldn't insert any Excel rows but we did insert leads, inform the user
      if (totalInsertedExcelRows === 0 && allInsertedLeads.length > 0) {
        toast({
          title: "Partial Success",
          description: `${allInsertedLeads.length} leads were created, but there was an issue storing the original Excel data. You can still access the leads.`,
          variant: "default"
        });
      }
      
    } catch (excelError) {
      console.error('Error handling Excel data storage:', excelError);
    }
    
    // Provide more detailed feedback to the user
    if (allInsertedLeads.length > 0) {
      toast({
        title: "Success",
        description: `Successfully processed ${allInsertedLeads.length} leads from your Excel file.`,
        variant: "default"
      });
    } else if (leadsToInsert.length > 0) {
      // We tried to insert, but nothing worked
      toast({
        title: "Error",
        description: "Failed to insert leads. Please check permissions or contact administrator.",
        variant: "destructive"
      });
    }
    
    return allInsertedLeads;
  } catch (error) {
    console.error('Critical error processing Excel:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An unexpected error occurred while processing your file.",
      variant: "destructive"
    });
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
    
    // Use direct delete instead of RPC
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
