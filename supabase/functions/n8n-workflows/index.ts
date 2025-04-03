
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { codeBlock, cors } from '../_shared/utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get environment variables
const n8nApiUrl = Deno.env.get('N8N_API_URL') || '';
const n8nApiKey = Deno.env.get('N8N_API_KEY') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  nodes: any[];
  connections: any;
  description?: string;
}

// Initialize Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify that the request is authorized with valid JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authenticated user and check if they're an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is an admin
    const { data: roleData, error: roleError } = await supabase
      .from('company_users')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || !roleData || roleData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body or query parameters
    let action = '';
    let workflowId = '';
    let data = {};

    const url = new URL(req.url);
    action = url.searchParams.get('action') || 'list';
    workflowId = url.searchParams.get('workflowId') || '';

    if (req.method === 'POST') {
      const body = await req.json();
      action = body.action || action;
      workflowId = body.workflowId || workflowId;
      data = body.data || {};
    }

    // Log the operation for debugging
    console.log(`Executing n8n workflow action: ${action}`);
    
    // Validate n8n API configuration
    if (!n8nApiUrl || !n8nApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing n8n API configuration', 
          details: 'N8N_API_URL and N8N_API_KEY must be configured in environment variables' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No need to append "/api/v1" since it should now be included in the config
    const apiBaseUrl = n8nApiUrl;
    console.log(`Using n8n API URL: ${apiBaseUrl}`);

    let response;
    let apiOptions: RequestInit = {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // Perform action based on request
    switch (action) {
      case 'list':
        // Fetch all workflows from n8n
        console.log(`Fetching workflows from: ${apiBaseUrl}/workflows`);
        break;
      
      case 'get':
        if (!workflowId) {
          return new Response(
            JSON.stringify({ error: 'Workflow ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const getUrl = `${apiBaseUrl}/workflows/${workflowId}`;
        console.log(`Fetching workflow details from: ${getUrl}`);
        break;

      case 'sync':
        // Sync all workflows from n8n to our database
        console.log(`Syncing workflows from n8n at: ${apiBaseUrl}/workflows`);
        
        try {
          const syncUrl = `${apiBaseUrl}/workflows`;
          console.log(`Making API request to: ${syncUrl}`);
          
          response = await fetch(syncUrl, apiOptions);
          
          // Check for HTML response indicating an error
          const contentType = response.headers.get('content-type');
          console.log(`Response content type: ${contentType}`);
          
          if (contentType && contentType.includes('text/html')) {
            const htmlContent = await response.text();
            console.error('Received HTML instead of JSON:', htmlContent.substring(0, 200)); // Log first 200 chars
            return new Response(
              JSON.stringify({ 
                error: 'Invalid response from n8n API',
                details: 'Received HTML instead of JSON. Check API URL and credentials.',
                debug: {
                  url: syncUrl,
                  contentType: contentType,
                  htmlPreview: htmlContent.substring(0, 200)
                }
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`n8n API error (${response.status}):`, errorText);
            return new Response(
              JSON.stringify({ 
                error: `Failed to fetch workflows from n8n: ${response.statusText}`,
                details: errorText,
                debug: {
                  status: response.status,
                  url: syncUrl
                }
              }),
              { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const workflows = await response.json() as Workflow[];
          console.log(`Fetched ${workflows.length} workflows from n8n`);

          // Process and store workflows in our database
          const syncResults = await Promise.all(workflows.map(async (workflow) => {
            // Check if workflow already exists
            const { data: existingWorkflow } = await supabase
              .from('n8n_workflows')
              .select('id')
              .eq('n8n_workflow_id', workflow.id)
              .single();

            if (existingWorkflow) {
              // Update existing workflow
              const { data: updatedWorkflow, error: updateError } = await supabase
                .from('n8n_workflows')
                .update({
                  name: workflow.name,
                  description: workflow.description || '',
                  tags: workflow.tags || [],
                  data: {
                    nodes: workflow.nodes,
                    connections: workflow.connections,
                    active: workflow.active
                  },
                  is_active: workflow.active
                })
                .eq('n8n_workflow_id', workflow.id)
                .select();

              if (updateError) {
                console.error(`Failed to update workflow ${workflow.id}:`, updateError);
                return { id: workflow.id, status: 'error', error: updateError.message };
              }
              return { id: workflow.id, status: 'updated' };
            } else {
              // Insert new workflow
              const { data: newWorkflow, error: insertError } = await supabase
                .from('n8n_workflows')
                .insert({
                  n8n_workflow_id: workflow.id,
                  name: workflow.name,
                  description: workflow.description || '',
                  tags: workflow.tags || [],
                  data: {
                    nodes: workflow.nodes,
                    connections: workflow.connections,
                    active: workflow.active
                  },
                  is_active: workflow.active
                })
                .select();

              if (insertError) {
                console.error(`Failed to insert workflow ${workflow.id}:`, insertError);
                return { id: workflow.id, status: 'error', error: insertError.message };
              }
              return { id: workflow.id, status: 'inserted' };
            }
          }));

          return new Response(
            JSON.stringify({ 
              message: `Synced ${workflows.length} workflows from n8n`,
              results: syncResults 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error) {
          console.error('Error syncing workflows:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to sync workflows', 
              details: error.message,
              stack: error.stack
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'share':
        if (!workflowId || !data.companyId) {
          return new Response(
            JSON.stringify({ error: 'Workflow ID and company ID are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the actual workflow UUID from our database using n8n_workflow_id
        const { data: workflowData, error: workflowError } = await supabase
          .from('n8n_workflows')
          .select('id')
          .eq('n8n_workflow_id', workflowId)
          .single();
        
        if (workflowError || !workflowData) {
          return new Response(
            JSON.stringify({ error: 'Workflow not found', details: workflowError?.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Share workflow with company
        const { data: shareData, error: shareError } = await supabase
          .from('customer_workflows')
          .upsert({
            workflow_id: workflowData.id,
            company_id: data.companyId,
            created_by: user.id
          })
          .select();

        if (shareError) {
          return new Response(
            JSON.stringify({ error: 'Failed to share workflow', details: shareError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Workflow shared successfully', data: shareData }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'unshare':
        if (!workflowId || !data.companyId) {
          return new Response(
            JSON.stringify({ error: 'Workflow ID and company ID are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get the actual workflow UUID from our database
        const { data: wfData, error: wfError } = await supabase
          .from('n8n_workflows')
          .select('id')
          .eq('n8n_workflow_id', workflowId)
          .single();
        
        if (wfError || !wfData) {
          return new Response(
            JSON.stringify({ error: 'Workflow not found', details: wfError?.message }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Remove workflow sharing with company
        const { data: unshareData, error: unshareError } = await supabase
          .from('customer_workflows')
          .delete()
          .match({ workflow_id: wfData.id, company_id: data.companyId });

        if (unshareError) {
          return new Response(
            JSON.stringify({ error: 'Failed to unshare workflow', details: unshareError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Workflow unshared successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Execute API request for list and get actions
    try {
      let apiUrl = '';
      
      if (action === 'list') {
        apiUrl = `${apiBaseUrl}/workflows`;
      } else if (action === 'get') {
        apiUrl = `${apiBaseUrl}/workflows/${workflowId}`;
      }
      
      console.log(`Executing request to: ${apiUrl}`);
      response = await fetch(apiUrl, apiOptions);
      
      // Check for HTML response
      const contentType = response.headers.get('content-type');
      console.log(`Response content type: ${contentType}`);
      
      if (contentType && contentType.includes('text/html')) {
        const htmlContent = await response.text();
        console.error('Received HTML instead of JSON:', htmlContent.substring(0, 200)); // Log first 200 chars
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response from n8n API',
            details: 'Received HTML instead of JSON. Check API URL and credentials.',
            debug: {
              url: apiUrl,
              contentType: contentType
            }
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`n8n API error (${response.status}):`, errorText);
        return new Response(
          JSON.stringify({ 
            error: `n8n API error: ${response.statusText}`,
            details: errorText,
            debug: {
              status: response.status,
              url: apiUrl
            }
          }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await response.json();

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error(`API request error for ${action}:`, error);
      return new Response(
        JSON.stringify({ 
          error: 'Error accessing n8n API', 
          details: error.message,
          stack: error.stack
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
