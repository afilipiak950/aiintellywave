
import { n8nApiUrl, n8nApiKey } from "../config.ts";
import { corsHeaders } from "../corsHeaders.ts";
import { getSupabaseClient } from "../utils.ts";

export async function handleSync(req: Request) {
  console.log(`[n8n-workflows:sync] Starting workflow sync process`);
  
  try {
    if (!n8nApiUrl || !n8nApiKey) {
      throw new Error("Missing n8n API configuration");
    }
    
    // Get Supabase client from the request
    const supabase = await getSupabaseClient(req);
    
    // Fetch workflows from n8n API
    console.log(`[n8n-workflows:sync] Fetching workflows from n8n API: ${n8nApiUrl}/workflows`);
    const n8nResponse = await fetch(`${n8nApiUrl}/workflows`, {
      method: "GET",
      headers: {
        "X-N8N-API-KEY": n8nApiKey
      }
    });
    
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error(`[n8n-workflows:sync] n8n API error: ${n8nResponse.status} ${errorText}`);
      throw new Error(`n8n API error: ${n8nResponse.status} ${errorText}`);
    }
    
    const workflowsData = await n8nResponse.json();
    console.log(`[n8n-workflows:sync] Fetched ${workflowsData.data?.length || 0} workflows from n8n`);
    
    if (!workflowsData.data || !Array.isArray(workflowsData.data)) {
      console.error(`[n8n-workflows:sync] Invalid response format from n8n API`);
      throw new Error("Invalid response format from n8n API");
    }
    
    // Process each workflow
    const results = [];
    for (const workflow of workflowsData.data) {
      try {
        const { id, name, active, createdAt, updatedAt, tags, nodes } = workflow;
        
        // Check if workflow already exists
        const { data: existingWorkflow, error: queryError } = await supabase
          .from('n8n_workflows')
          .select('id')
          .eq('n8n_workflow_id', id)
          .maybeSingle();
        
        if (queryError) {
          console.error(`[n8n-workflows:sync] Error checking for existing workflow: ${queryError.message}`);
          results.push({
            id,
            name,
            status: "error",
            message: `Error checking for existing workflow: ${queryError.message}`
          });
          continue;
        }
        
        // Prepare workflow data for database
        const workflowData = {
          n8n_workflow_id: id,
          name,
          description: workflow.description || `n8n workflow: ${name}`,
          active,
          created_at: new Date(createdAt),
          updated_at: new Date(updatedAt),
          tags: tags || [],
          data: workflow,
          nodes_count: nodes?.length || 0
        };
        
        // Insert or update workflow
        if (existingWorkflow) {
          const { error: updateError } = await supabase
            .from('n8n_workflows')
            .update(workflowData)
            .eq('n8n_workflow_id', id);
          
          if (updateError) {
            console.error(`[n8n-workflows:sync] Error updating workflow: ${updateError.message}`);
            results.push({
              id,
              name,
              status: "error",
              message: `Error updating workflow: ${updateError.message}`
            });
          } else {
            console.log(`[n8n-workflows:sync] Updated workflow: ${name} (${id})`);
            results.push({
              id,
              name,
              status: "updated"
            });
          }
        } else {
          const { error: insertError } = await supabase
            .from('n8n_workflows')
            .insert(workflowData);
          
          if (insertError) {
            console.error(`[n8n-workflows:sync] Error inserting workflow: ${insertError.message}`);
            results.push({
              id,
              name,
              status: "error",
              message: `Error inserting workflow: ${insertError.message}`
            });
          } else {
            console.log(`[n8n-workflows:sync] Inserted workflow: ${name} (${id})`);
            results.push({
              id,
              name,
              status: "inserted"
            });
          }
        }
      } catch (workflowError: any) {
        console.error(`[n8n-workflows:sync] Error processing workflow: ${workflowError.message}`);
        results.push({
          id: workflow.id,
          name: workflow.name,
          status: "error",
          message: `Error processing workflow: ${workflowError.message}`
        });
      }
    }
    
    console.log(`[n8n-workflows:sync] Sync completed. Processed ${results.length} workflows`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${results.length} workflows`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error(`[n8n-workflows:sync] Error: ${error.message}`);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
