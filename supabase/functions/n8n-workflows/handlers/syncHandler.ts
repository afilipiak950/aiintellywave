
import { corsHeaders } from "../corsHeaders.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Function to synchronize workflows from n8n to the database
export async function handleSyncWorkflows(
  supabase: SupabaseClient, 
  n8nApiUrl: string, 
  n8nApiKey: string
) {
  console.log("[n8n-workflows] Starting workflow sync process");
  
  try {
    // Validate inputs
    if (!n8nApiUrl) {
      throw new Error("Missing n8n API URL environment variable");
    }
    
    if (!n8nApiKey) {
      throw new Error("Missing n8n API Key environment variable");
    }
    
    console.log(`[n8n-workflows] Connecting to n8n API at: ${n8nApiUrl}`);
    
    // Fetch workflows from n8n API
    const n8nResponse = await fetch(`${n8nApiUrl}/workflows`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": n8nApiKey,
        "Content-Type": "application/json"
      }
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`[n8n-workflows] n8n API responded with status: ${n8nResponse.status}`);
      console.error(`[n8n-workflows] Error details: ${errorText}`);
      
      throw new Error(`n8n API responded with status ${n8nResponse.status}: ${errorText}`);
    }

    const workflows = await n8nResponse.json();
    
    // Debug: Log full workflow data structure to identify any issues
    console.log(`[n8n-workflows] Fetched ${workflows.data?.length || 0} workflows from n8n`);
    console.log(`[n8n-workflows] First workflow sample structure:`, 
      workflows.data && workflows.data.length > 0 ? JSON.stringify(workflows.data[0], null, 2).substring(0, 1000) + "..." : "No workflows");
    
    if (!workflows.data || !Array.isArray(workflows.data)) {
      throw new Error("Invalid response from n8n API: Expected an array of workflows");
    }
    
    // Process each workflow
    const results = await Promise.all(workflows.data.map(async (workflow: any, index: number) => {
      try {
        // Debug: Output key fields for each workflow to verify correct structure
        console.log(`[n8n-workflows] Processing workflow ${index+1}/${workflows.data.length}: ID=${workflow.id}, Name=${workflow.name}`);

        // Verify required fields
        if (!workflow.id) {
          return { id: `unknown-${index}`, status: 'error', message: 'Missing workflow ID in n8n response' };
        }
        
        // Check if the workflow already exists in the database
        const { data: existingWorkflows, error: findError } = await supabase
          .from('n8n_workflows')
          .select('*')
          .eq('n8n_workflow_id', workflow.id)
          .limit(1);
          
        if (findError) {
          console.error(`[n8n-workflows] Error finding workflow ${workflow.id}: ${findError.message}`);
          return { id: workflow.id, status: 'error', message: findError.message };
        }
        
        // Prepare workflow data with proper error checks
        const workflowData = {
          n8n_workflow_id: workflow.id,
          name: workflow.name || `Unnamed Workflow ${workflow.id}`, // Ensure name is never null
          description: workflow.description || '',
          active: typeof workflow.active === 'boolean' ? workflow.active : false,
          created_at: workflow.createdAt ? new Date(workflow.createdAt).toISOString() : new Date().toISOString(),
          updated_at: workflow.updatedAt ? new Date(workflow.updatedAt).toISOString() : new Date().toISOString(),
          tags: Array.isArray(workflow.tags) ? workflow.tags : [],
          data: workflow // Store complete workflow data
        };
        
        // Log workflow data being inserted/updated for debugging
        console.log(`[n8n-workflows] Workflow data prepared for DB:`, {
          id: workflowData.n8n_workflow_id,
          name: workflowData.name,
          active: workflowData.active,
          tags: workflowData.tags.length
        });
        
        if (existingWorkflows && existingWorkflows.length > 0) {
          // Update existing workflow
          const { error: updateError } = await supabase
            .from('n8n_workflows')
            .update(workflowData)
            .eq('n8n_workflow_id', workflow.id);
            
          if (updateError) {
            console.error(`[n8n-workflows] Error updating workflow ${workflow.id}: ${updateError.message}`);
            console.error(`[n8n-workflows] Update error details:`, updateError);
            return { id: workflow.id, status: 'error', message: updateError.message };
          }
          
          return { id: workflow.id, status: 'updated', name: workflow.name };
        } else {
          // Insert new workflow
          const { error: insertError } = await supabase
            .from('n8n_workflows')
            .insert([workflowData]);
            
          if (insertError) {
            console.error(`[n8n-workflows] Error inserting workflow ${workflow.id}: ${insertError.message}`);
            console.error(`[n8n-workflows] Insert error details:`, insertError);
            return { id: workflow.id, status: 'error', message: insertError.message };
          }
          
          return { id: workflow.id, status: 'inserted', name: workflow.name };
        }
      } catch (error: any) {
        console.error(`[n8n-workflows] Error processing workflow ${workflow.id || 'unknown'}: ${error.message}`);
        return { id: workflow.id || `unknown-${index}`, status: 'error', message: error.message };
      }
    }));
    
    // Count successes and errors
    const successes = results.filter(r => r.status === 'updated' || r.status === 'inserted').length;
    const errors = results.filter(r => r.status === 'error').length;
    
    // Group errors by message for better analysis
    const errorGroups: Record<string, number> = {};
    results.filter(r => r.status === 'error').forEach(r => {
      const message = r.message || 'Unknown error';
      errorGroups[message] = (errorGroups[message] || 0) + 1;
    });
    
    console.log(`[n8n-workflows] Sync completed: ${successes} workflows processed successfully, ${errors} errors`);
    console.log(`[n8n-workflows] Error summary:`, errorGroups);
    
    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${successes} workflows${errors > 0 ? ` with ${errors} errors` : ''}`,
        results,
        errorSummary: errorGroups
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error: any) {
    console.error(`[n8n-workflows] Sync error: ${error.message}`);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
}
