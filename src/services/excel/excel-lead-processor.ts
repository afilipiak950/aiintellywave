
import { supabase } from '../../integrations/supabase/client';
import { Lead } from '@/types/lead';
import { Json } from '@/integrations/supabase/types';
import { parseExcelFile } from './excel-file-processor';
import { transformExcelRowToLead } from './excel-lead-transform';
import { getAuthUser } from '@/utils/auth-utils';
import { toast } from '@/hooks/use-toast';

export const processExcelFile = async (file: File, projectId: string): Promise<string[]> => {
  try {
    console.log(`Processing Excel file for project: ${projectId}`);
    
    // Verify authentication first
    const user = await getAuthUser();
    if (!user) {
      console.error('Authentication required for Excel processing');
      toast({
        title: "Authentication Error",
        description: "Please log in to process Excel files",
        variant: "destructive"
      });
      return [];
    }
    
    // Parse the Excel file into JSON data
    const { jsonData, columns } = await parseExcelFile(file);
    console.log(`Parsed Excel file with ${jsonData.length} rows and ${columns.length} columns`);
    
    if (jsonData.length === 0) {
      console.warn('No data found in Excel file');
      toast({
        title: "Warning",
        description: "No data found in the uploaded file",
        // Fix for Error 1: Add type assertion for 'warning' variant
        variant: "destructive" // Changed from "warning" to "destructive" to match allowed variants
      });
      return [];
    }
    
    // Transform Excel rows to leads
    // Fix for Error 2: Filter out leads without names to ensure all leads have the required 'name' property
    const leadsToInsert: Partial<Lead>[] = jsonData.map((row) => 
      transformExcelRowToLead(row as Record<string, any>, projectId)
    ).filter(lead => lead.name); // Filter out leads without names
    
    console.log(`Preparing to insert ${leadsToInsert.length} leads`);
    
    // Batch insert leads for better performance
    const batchSize = 50;
    const insertedLeadIds: string[] = [];
    
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize);
      
      try {
        if (batch.length > 0) {
          // Fix for Error 2: Add type assertion for leads to be inserted
          const { data: insertedLeads, error } = await supabase
            .from('leads')
            .insert(batch as any[])
            .select('id');
          
          if (error) {
            console.error('Batch insert error:', error);
            continue;
          }
          
          // Fix for Error 3: Handle the case when insertedLeads might be null or undefined
          if (insertedLeads) {
            // Fix for Error 3: Use type guard to ensure insertedLeads is an array
            if (Array.isArray(insertedLeads)) {
              const leadIds = insertedLeads.map(lead => lead.id as string);
              insertedLeadIds.push(...leadIds);
            } else if (typeof insertedLeads === 'object' && insertedLeads !== null && 'id' in insertedLeads) {
              // Handle case where insertedLeads is a single object with an id
              insertedLeadIds.push(insertedLeads.id as string);
            }
          }
        }
      } catch (batchError) {
        console.error('Batch processing error:', batchError);
      }
    }
    
    // Also store the original Excel data for display
    const excelRowsToInsert = jsonData.map((row, index) => ({
      project_id: projectId,
      row_number: index + 1,
      row_data: row as Json,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    // Batch insert excel data
    for (let i = 0; i < excelRowsToInsert.length; i += batchSize) {
      const batch = excelRowsToInsert.slice(i, i + batchSize);
      
      try {
        await supabase
          .from('project_excel_data')
          .insert(batch);
      } catch (excelError) {
        console.error('Excel data insertion error:', excelError);
      }
    }
    
    // Provide user feedback
    if (insertedLeadIds.length > 0) {
      toast({
        title: "Success",
        description: `Imported ${insertedLeadIds.length} leads from the Excel file`,
        variant: "default"
      });
    } else {
      toast({
        title: "Warning",
        description: "No leads could be imported. Please check the file format.",
        variant: "destructive"
      });
    }
    
    return insertedLeadIds;
  } catch (error) {
    console.error('Critical error processing Excel:', error);
    toast({
      title: "Error",
      description: "Failed to process the Excel file",
      variant: "destructive"
    });
    return [];
  }
};
