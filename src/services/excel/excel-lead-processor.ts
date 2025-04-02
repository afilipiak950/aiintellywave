
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
        variant: "warning"
      });
      return [];
    }
    
    // Transform Excel rows to leads
    const leadsToInsert: Partial<Lead>[] = jsonData.map((row) => 
      transformExcelRowToLead(row as Record<string, any>, projectId)
    );
    
    console.log(`Preparing to insert ${leadsToInsert.length} leads`);
    
    // Batch insert leads for better performance
    const batchSize = 50;
    const insertedLeadIds: string[] = [];
    
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      const batch = leadsToInsert.slice(i, i + batchSize);
      
      try {
        const { data: insertedLeads, error } = await supabase
          .from('leads')
          .insert(batch)
          .select('id');
        
        if (error) {
          console.error('Batch insert error:', error);
          continue;
        }
        
        if (insertedLeads) {
          const leadIds = Array.isArray(insertedLeads) 
            ? insertedLeads.map(lead => lead.id) 
            : [insertedLeads.id];
          
          insertedLeadIds.push(...leadIds);
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
