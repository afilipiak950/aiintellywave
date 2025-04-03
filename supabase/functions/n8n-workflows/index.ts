
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

    let response;
    let apiUrl = `${n8nApiUrl}/workflows`;
    let apiOptions: RequestInit = {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json'
      }
    };

    // Perform action based on request
    switch (action) {
      case 'list':
        // Fetch all workflows from n8n
        break;
      
      case 'get':
        if (!workflowId) {
          return new Response(
            JSON.stringify({ error: 'Workflow ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `${apiUrl}/${workflowId}`;
        break;

      case 'sync':
        // Sync all workflows from n8n to our database
        response = await fetch(apiUrl, apiOptions);
        
        if (!response.ok) {
          return new Response(
            JSON.stringify({ error: `Failed to fetch workflows from n8n: ${response.statusText}` }),
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
    response = await fetch(apiUrl, apiOptions);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `n8n API error: ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
