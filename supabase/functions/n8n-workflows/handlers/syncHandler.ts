
import { corsHeaders } from "../corsHeaders.ts";
import { n8nApiUrl, n8nApiKey } from "../config.ts";
import { getSupabaseClient } from "../utils.ts";

export async function handleSync(req: Request) {
  console.log("[n8n-workflows:sync] Starting workflow sync from n8n");
  
  try {
    // Check environment variables with detailed logging
    if (!n8nApiUrl || !n8nApiKey) {
      const missingVars = [];
      if (!n8nApiUrl) missingVars.push("N8N_API_URL");
      if (!n8nApiKey) missingVars.push("N8N_API_KEY");
      
      console.error(`[n8n-workflows:sync] Missing required environment variables: ${missingVars.join(", ")}`);
      throw new Error(`Required environment variables ${missingVars.join(", ")} are not set.`);
    }
    
    // Get workflows from n8n with detailed logging
    console.log(`[n8n-workflows:sync] Fetching workflows from ${n8nApiUrl}`);
    console.log(`[n8n-workflows:sync] Using API key: ${n8nApiKey.substring(0, 10)}...`);
    
    let n8nResponse;
    try {
      console.log(`[n8n-workflows:sync] Making fetch request to ${n8nApiUrl}/workflows`);
      n8nResponse = await fetch(`${n8nApiUrl}/workflows`, {
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Accept': 'application/json'
        }
      });
      
      console.log(`[n8n-workflows:sync] n8n API response status: ${n8nResponse.status}`);
    } catch (fetchError: any) {
      console.error(`[n8n-workflows:sync] Fetch error details:`, fetchError);
      
      // Enhanced error messages for network issues
      if (fetchError.message?.includes("Failed to fetch") || 
          fetchError.message?.includes("NetworkError")) {
        throw new Error(`Network error when connecting to n8n: ${fetchError.message}. Please check if the N8N API URL is correct and accessible.`);
      }
      throw new Error(`Network error when connecting to n8n: ${fetchError.message}`);
    }
    
    // Check if response is HTML instead of JSON (which indicates an issue)
    const contentType = n8nResponse.headers.get('content-type');
    console.log(`[n8n-workflows:sync] Response content-type: ${contentType}`);
    
    if (contentType && contentType.includes('text/html')) {
      const htmlContent = await n8nResponse.text();
      console.error("[n8n-workflows:sync] Received HTML response instead of JSON. First 100 chars:", htmlContent.substring(0, 100));
      throw new Error("Received HTML response from n8n API. API URL might be incorrect or missing /api/v1 path. Check if the URL is correct and ends with /api/v1");
    }
    
    if (!n8nResponse.ok) {
      let errorText;
      try {
        // Try to parse error as JSON first
        const errorJson = await n8nResponse.json();
        errorText = JSON.stringify(errorJson);
      } catch (e) {
        // Fall back to text if not JSON
        errorText = await n8nResponse.text();
      }
      
      console.error(`[n8n-workflows:sync] n8n API error (${n8nResponse.status}): ${errorText}`);
      
      // Enhanced error messages based on status codes
      if (n8nResponse.status === 401) {
        throw new Error(`Authentication failed with n8n API: Invalid API key or unauthorized access.`);
      } else if (n8nResponse.status === 404) {
        throw new Error(`n8n API endpoint not found: ${n8nApiUrl}/workflows - Check if the URL is correct.`);
      } else {
        throw new Error(`Failed to fetch workflows from n8n: ${n8nResponse.status} ${errorText}`);
      }
    }
    
    // Parse the response
    let workflows;
    try {
      workflows = await n8nResponse.json();
      console.log(`[n8n-workflows:sync] Retrieved ${workflows.data?.length || 0} workflows from n8n`);
    } catch (jsonError: any) {
      console.error("[n8n-workflows:sync] JSON parse error:", jsonError);
      throw new Error("Failed to parse n8n API response as JSON. Check if the API is returning valid JSON data.");
    }
    
    if (!workflows.data || !Array.isArray(workflows.data)) {
      console.error("[n8n-workflows:sync] Unexpected response format:", workflows);
      throw new Error("Invalid workflow data received from n8n. Expected an array of workflows.");
    }
    
    // Get Supabase client
    console.log("[n8n-workflows:sync] Initializing Supabase client");
    const supabaseClient = await getSupabaseClient(req);
    
    // Process each workflow
    const results = [];
    for (const workflow of workflows.data) {
      try {
        const { id, name, active, nodes, connections, staticData, settings, pinData, tags } = workflow;
        
        // Convert full data to a simpler structure
        const data = { nodes, connections, staticData, settings, pinData };
        
        // Format tags as an array of strings
        const tagNames = tags ? tags.map((tag: any) => tag.name) : [];
        
        console.log(`[n8n-workflows:sync] Processing workflow: ${name} (${id})`);
        
        // Get existing workflow by n8n ID
        const { data: existingWorkflow, error: queryError } = await supabaseClient
          .from('n8n_workflows')
          .select('id')
          .eq('n8n_workflow_id', id)
          .maybeSingle();
        
        if (queryError) {
          console.error(`[n8n-workflows:sync] Error querying workflow ${id}:`, queryError);
          throw new Error(`Error querying workflow: ${queryError.message}`);
        }
        
        let result;
        // Update or insert the workflow
        if (existingWorkflow) {
          console.log(`[n8n-workflows:sync] Updating existing workflow: ${id}`);
          const { data: updatedWorkflow, error: updateError } = await supabaseClient
            .from('n8n_workflows')
            .update({
              name,
              description: settings?.description || null,
              is_active: active,
              data,
              tags: tagNames
            })
            .eq('n8n_workflow_id', id)
            .select()
            .single();
          
          if (updateError) {
            console.error(`[n8n-workflows:sync] Error updating workflow ${id}:`, updateError);
            throw new Error(`Error updating workflow: ${updateError.message}`);
          }
          
          result = { action: 'updated', workflow: updatedWorkflow };
        } else {
          console.log(`[n8n-workflows:sync] Adding new workflow: ${id}`);
          const { data: newWorkflow, error: insertError } = await supabaseClient
            .from('n8n_workflows')
            .insert({
              n8n_workflow_id: id,
              name,
              description: settings?.description || null,
              is_active: active,
              data,
              tags: tagNames
            })
            .select()
            .single();
          
          if (insertError) {
            console.error(`[n8n-workflows:sync] Error inserting workflow ${id}:`, insertError);
            throw new Error(`Error inserting workflow: ${insertError.message}`);
          }
          
          result = { action: 'added', workflow: newWorkflow };
        }
        
        results.push(result);
      } catch (error: any) {
        console.error(`[n8n-workflows:sync] Error processing workflow ${workflow.id}:`, error);
        results.push({ action: 'error', workflowId: workflow.id, error: error.message });
      }
    }
    
    console.log(`[n8n-workflows:sync] Sync completed with ${results.length} results`);
    
    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    console.error("[n8n-workflows:sync] Error in sync handler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
