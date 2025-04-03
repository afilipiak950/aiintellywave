
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
    console.log(`[n8n-workflows] Fetched ${workflows.data?.length || 0} workflows from n8n`);
    
    if (!workflows.data || !Array.isArray(workflows.data)) {
      throw new Error("Invalid response from n8n API: Expected an array of workflows");
    }
    
    // Process each workflow
    const results = await Promise.all(workflows.data.map(async (workflow: any) => {
      try {
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
        
        const workflowData = {
          n8n_workflow_id: workflow.id,
          name: workflow.name,
          description: workflow.description || '',
          active: workflow.active,
          created_at: new Date(workflow.createdAt).toISOString(),
          updated_at: new Date(workflow.updatedAt).toISOString(),
          tags: workflow.tags || [],
          data: workflow
        };
        
        if (existingWorkflows && existingWorkflows.length > 0) {
          // Update existing workflow
          const { error: updateError } = await supabase
            .from('n8n_workflows')
            .update(workflowData)
            .eq('n8n_workflow_id', workflow.id);
            
          if (updateError) {
            console.error(`[n8n-workflows] Error updating workflow ${workflow.id}: ${updateError.message}`);
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
            return { id: workflow.id, status: 'error', message: insertError.message };
          }
          
          return { id: workflow.id, status: 'inserted', name: workflow.name };
        }
      } catch (error: any) {
        console.error(`[n8n-workflows] Error processing workflow ${workflow.id}: ${error.message}`);
        return { id: workflow.id, status: 'error', message: error.message };
      }
    }));
    
    // Count successes and errors
    const successes = results.filter(r => r.status === 'updated' || r.status === 'inserted').length;
    const errors = results.filter(r => r.status === 'error').length;
    
    console.log(`[n8n-workflows] Sync completed: ${successes} workflows processed successfully, ${errors} errors`);
    
    // Return the results
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${successes} workflows${errors > 0 ? ` with ${errors} errors` : ''}`,
        results
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
