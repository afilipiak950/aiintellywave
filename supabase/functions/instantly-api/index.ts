
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncWorkflowsResponse {
  inserted: number;
  updated: number;
  errors: number;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Get Supabase client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Parse request body
    const { action } = await req.json();

    // Start tracking time for logging
    const startTime = performance.now();
    let duration: number;
    let status = 200;
    let errorMessage: string | null = null;

    if (action === 'sync_workflows') {
      // Get API key from config
      const { data: configData, error: configError } = await supabaseClient
        .from('instantly_integration.config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (configError) {
        throw new Error(`Failed to get API configuration: ${configError.message}`);
      }

      // Get the API key and URL
      const apiKey = configData.api_key;
      const apiUrl = 'https://intellywave.app.n8n.cloud/api/v1/workflows';

      console.log(`Fetching workflows from ${apiUrl}`);
      
      // Log the request to the database
      const { data: logData, error: logError } = await supabaseClient
        .from('instantly_integration.logs')
        .insert({
          endpoint: apiUrl,
          request_payload: { action }
        })
        .select()
        .single();

      if (logError) {
        console.error('Failed to log API request:', logError);
      }

      // Fetch workflows from Instantly API
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        status = response.status;
        errorMessage = responseData.message || 'Unknown API error';
        throw new Error(`API returned error ${response.status}: ${errorMessage}`);
      }

      // Process the workflows
      const result: SyncWorkflowsResponse = {
        inserted: 0,
        updated: 0,
        errors: 0
      };

      // Store or update workflows in the database
      for (const workflow of responseData.data) {
        try {
          // Check if workflow already exists
          const { data: existingWorkflow, error: checkError } = await supabaseClient
            .from('instantly_integration.workflows')
            .select('id')
            .eq('workflow_id', workflow.id)
            .maybeSingle();

          if (checkError) {
            console.error(`Error checking workflow ${workflow.id}:`, checkError);
            result.errors++;
            continue;
          }

          // Prepare workflow data
          const workflowData = {
            workflow_id: workflow.id,
            workflow_name: workflow.name,
            description: workflow.description || null,
            created_at: new Date(workflow.createdAt).toISOString(),
            updated_at: new Date(workflow.updatedAt).toISOString(),
            status: workflow.active ? 'active' : 'inactive',
            is_active: workflow.active,
            tags: workflow.tags || [],
            raw_data: workflow
          };

          if (existingWorkflow) {
            // Update existing workflow
            const { error: updateError } = await supabaseClient
              .from('instantly_integration.workflows')
              .update(workflowData)
              .eq('id', existingWorkflow.id);

            if (updateError) {
              console.error(`Error updating workflow ${workflow.id}:`, updateError);
              result.errors++;
            } else {
              result.updated++;
            }
          } else {
            // Insert new workflow
            const { error: insertError } = await supabaseClient
              .from('instantly_integration.workflows')
              .insert(workflowData);

            if (insertError) {
              console.error(`Error inserting workflow ${workflow.id}:`, insertError);
              result.errors++;
            } else {
              result.inserted++;
            }
          }
        } catch (error) {
          console.error(`Error processing workflow ${workflow.id}:`, error);
          result.errors++;
        }
      }

      // Update last_updated timestamp in config
      await supabaseClient
        .from('instantly_integration.config')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', configData.id);

      // Finish timing and update log
      duration = performance.now() - startTime;
      
      if (logData) {
        await supabaseClient
          .from('instantly_integration.logs')
          .update({ 
            status,
            error_message: errorMessage,
            response_payload: result,
            duration_ms: Math.round(duration)
          })
          .eq('id', logData.id);
      }

      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
