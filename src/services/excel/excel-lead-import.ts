
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
      toast({
        title: "Error",
        description: "Failed to fetch Excel data from the project",
        variant: "destructive"
      });
      return [];
    }
    
    if (!excelRows || excelRows.length === 0) {
      toast({
        title: "Warning",
        description: "No Excel data found to import as leads",
        variant: "destructive"
      });
      return [];
    }
    
    // Transform Excel rows into leads with improved mapping
    const leadsToInsert: Partial<Lead>[] = excelRows.map((row) => {
      // Ensure row_data is an object before passing it to transformExcelRowToLead
      const rowData = typeof row.row_data === 'string' 
        ? JSON.parse(row.row_data) 
        : row.row_data;
      
      return transformExcelRowToLead(rowData, projectId);
    });
    
    // Split into batches to avoid payload size limits
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < leadsToInsert.length; i += batchSize) {
      batches.push(leadsToInsert.slice(i, i + batchSize));
    }
    
    let insertedLeadIds: string[] = [];
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        // Try RPC function first to bypass RLS
        const { data: insertedLeads, error: rpcError } = await supabase.rpc(
          'insert_leads_admin',
          { 
            leads_data: JSON.stringify(batch),
            project: projectId
          }
        );
        
        if (rpcError) {
          console.error(`Failed to use RPC for batch ${i+1}, trying direct insert:`, rpcError);
          
          // Fallback to direct insert
          const { data: directInsertedLeads, error: leadsInsertError } = await supabase
            .from('leads')
            .insert(batch)
            .select('id');
          
          if (leadsInsertError) {
            toast({
              title: "Error",
              description: `Failed to insert batch ${i+1} of leads: ${leadsInsertError.message}`,
              variant: "destructive"
            });
            // Continue with next batch instead of failing completely
          } else {
            if (directInsertedLeads) {
              insertedLeadIds = [...insertedLeadIds, ...directInsertedLeads.map(lead => lead.id)];
            }
          }
        } else {
          if (insertedLeads) {
            insertedLeadIds = [...insertedLeadIds, ...insertedLeads.map(lead => lead.id)];
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
    
    if (insertedLeadIds.length > 0) {
      toast({
        title: "Success",
        description: `Imported ${insertedLeadIds.length} leads from project Excel data`,
        variant: "default"
      });
    } else {
      toast({
        title: "Warning",
        description: "No leads were imported. This could be due to permission issues.",
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
