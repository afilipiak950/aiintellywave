
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { toast } from '@/hooks/use-toast';
import { transformExcelRowToLead } from './excel-lead-transform';
import { getAuthUser } from '@/utils/auth-utils';

/**
 * Imports all Excel data rows from a project into the leads table
 * @param projectId The project ID to import Excel data from
 * @returns Array of inserted lead IDs or empty array on error
 */
export const importProjectExcelToLeads = async (projectId: string): Promise<string[]> => {
  try {
    // Verify authentication
    const user = await getAuthUser();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to import Excel leads",
        variant: "destructive"
      });
      return [];
    }
    
    // Fetch the project Excel data
    const { data: excelRows, error: excelError } = await supabase
      .from('project_excel_data')
      .select('id, row_number, row_data')
      .eq('project_id', projectId)
      .order('row_number', { ascending: true });
      
    if (excelError) {
      console.error('Failed to fetch Excel data:', excelError);
      toast({
        title: "Error",
        description: "Failed to fetch Excel data from the project",
        variant: "destructive"
      });
      return [];
    }
    
    if (!excelRows || excelRows.length === 0) {
      console.warn('No Excel data found to import');
      toast({
        title: "Warning",
        description: "No Excel data found to import as leads",
        variant: "destructive"
      });
      return [];
    }
    
    console.log(`Found ${excelRows.length} Excel rows to import as leads`);
    
    // Get project details to include in lead tags
    const { data: projectData } = await supabase
      .from('projects')
      .select('name')
      .eq('id', projectId)
      .single();
      
    const projectName = projectData?.name || 'unknown-project';
    
    // Transform Excel rows into leads with improved mapping
    const leadsToInsert: Partial<Lead>[] = excelRows.map((row) => {
      // Ensure row_data is an object before passing it to transformExcelRowToLead
      const rowData = typeof row.row_data === 'string' 
        ? JSON.parse(row.row_data) 
        : row.row_data;
      
      const leadData = transformExcelRowToLead(rowData, projectId);
      
      // Add project-specific tag to make filtering easier
      leadData.tags = [...(leadData.tags || []), 'excel-import', `project-${projectName}`];
      
      return leadData;
    });
    
    console.log(`Transformed ${leadsToInsert.length} Excel rows to leads`);
    
    // Split into batches to avoid payload size limits
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      batches.push(leadsToInsert.slice(i, i + batchSize));
    }
    
    let insertedLeadIds: string[] = [];
    
    // Process each batch with direct insert instead of RPC
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1} of ${batches.length}`);
      
      try {
        // Use direct insert instead of RPC
        const { data: insertedLeads, error: leadsInsertError } = await supabase
          .from('leads')
          .insert(batch)
          .select('id');
        
        if (leadsInsertError) {
          console.error(`Failed to insert batch ${i+1}:`, leadsInsertError);
          
          // Try individual inserts as fallback
          for (const lead of batch) {
            try {
              const { data: singleLead, error: singleError } = await supabase
                .from('leads')
                .insert(lead)
                .select('id');
                
              if (!singleError && singleLead && Array.isArray(singleLead) && singleLead.length > 0) {
                insertedLeadIds.push(singleLead[0].id);
              }
            } catch (singleInsertError) {
              console.error('Error in individual lead insert:', singleInsertError);
            }
          }
        } else {
          // Type guard to ensure insertedLeads is an array before using map
          if (insertedLeads && Array.isArray(insertedLeads)) {
            const leadIds = insertedLeads.map(lead => lead.id);
            insertedLeadIds = [...insertedLeadIds, ...leadIds];
            console.log(`Successfully inserted ${leadIds.length} leads in batch ${i+1}`);
          }
        }
      } catch (batchError) {
        console.error(`Error processing batch ${i+1}:`, batchError);
      }
    }
    
    // Refresh the leads count with a direct query to confirm
    const { count: leadsCount, error: countError } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);
    
    console.log(`Confirmed leads count for project: ${leadsCount}`);
    
    if (insertedLeadIds.length > 0) {
      toast({
        title: "Success",
        description: `Imported ${insertedLeadIds.length} leads from project Excel data`,
        variant: "default"
      });
      
      // Force invalidate the leads cache to ensure the new leads show up immediately
      // This is done by making a dummy update to one lead to trigger revalidation via webhooks
      if (insertedLeadIds.length > 0) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', insertedLeadIds[0]);
          
        if (updateError) {
          console.error('Error triggering cache invalidation:', updateError);
        }
      }
    } else {
      toast({
        title: "Warning",
        description: "No leads were imported. This could be due to permission issues or duplicate data.",
        variant: "destructive"
      });
    }
    
    return insertedLeadIds;
  } catch (error) {
    console.error('Critical error importing Excel data as leads:', error);
    toast({
      title: "Error",
      description: "Failed to import Excel data as leads. See console for details.",
      variant: "destructive"
    });
    return [];
  }
};
