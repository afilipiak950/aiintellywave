
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../n8n-workflows/corsHeaders.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Edge function configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RequestPayload {
  action: string;
  data?: any;
}

async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get request data
    const payload: RequestPayload = await req.json();
    const { action, data } = payload;
    const startTime = Date.now();
    
    // Auth check - get token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }
    
    const token = authHeader.split(' ')[1];
    const { data: sessionData, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !sessionData.user) {
      throw new Error('Unauthorized access');
    }
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', sessionData.user.id)
      .eq('role', 'admin')
      .single();
      
    if (roleError || !roleData) {
      throw new Error('Admin access required');
    }

    // Get API configuration from database
    const { data: configData, error: configError } = await supabaseAdmin
      .from('instantly_integration.config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (configError || !configData) {
      throw new Error('API configuration not found');
    }
    
    // Extract API details
    const apiUrl = configData.api_url;
    const apiKey = configData.api_key;
    
    // Process different actions
    let result;
    let responsePayload;
    let statusCode = 200;
    let errorMessage = null;
    
    try {
      switch (action) {
        case 'fetch_workflows':
          result = await fetchWorkflows(apiUrl, apiKey);
          break;
        case 'sync_workflows':
          result = await syncWorkflows(apiUrl, apiKey);
          break;
        case 'get_workflow_details':
          if (!data?.workflow_id) {
            throw new Error('Workflow ID is required');
          }
          result = await getWorkflowDetails(apiUrl, apiKey, data.workflow_id);
          break;
        case 'update_workflow':
          if (!data?.workflow_id) {
            throw new Error('Workflow ID is required');
          }
          result = await updateWorkflow(data);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      responsePayload = { success: true, data: result };
    } catch (actionError: any) {
      console.error(`Error in ${action}:`, actionError);
      statusCode = 400;
      errorMessage = actionError.message;
      responsePayload = { 
        success: false, 
        error: actionError.message,
        errorDetails: actionError.toString()
      };
    }
    
    // Calculate duration
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log the API call
    await supabaseAdmin.from('instantly_integration.logs').insert({
      endpoint: action,
      request_payload: data || {},
      response_payload: responsePayload,
      status: statusCode,
      error_message: errorMessage,
      duration_ms: duration
    });
    
    // Return the response
    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode
    });
    
  } catch (error: any) {
    console.error("Error handling request:", error);
    
    // Log server errors
    try {
      await supabaseAdmin.from('instantly_integration.logs').insert({
        endpoint: 'error',
        request_payload: { url: req.url },
        response_payload: null,
        status: 500,
        error_message: error.message
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
}

// Fetch workflows from the Instantly API
async function fetchWorkflows(apiUrl: string, apiKey: string): Promise<any> {
  // Format the URL correctly - n8n uses /api/v1/workflows for listing workflows
  const baseApiUrl = apiUrl.replace('/home/workflows', '');
  const url = `${baseApiUrl}/api/v1/workflows`;
  
  console.log(`Fetching workflows from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-N8N-API-KEY': apiKey
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
}

// Fetch workflow details by ID
async function getWorkflowDetails(apiUrl: string, apiKey: string, workflowId: string): Promise<any> {
  // Format the URL correctly
  const baseApiUrl = apiUrl.replace('/home/workflows', '');
  const url = `${baseApiUrl}/api/v1/workflows/${workflowId}`;
  
  console.log(`Fetching workflow details from: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'X-N8N-API-KEY': apiKey
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return await response.json();
}

// Sync workflows from API to database
async function syncWorkflows(apiUrl: string, apiKey: string): Promise<any> {
  // Get workflows from API
  const workflows = await fetchWorkflows(apiUrl, apiKey);
  
  if (!workflows || !Array.isArray(workflows.data)) {
    throw new Error('Invalid API response format');
  }
  
  const results = {
    total: workflows.data.length,
    inserted: 0,
    updated: 0,
    errors: 0,
    errorDetails: [] as string[]
  };
  
  // Process each workflow
  for (const workflow of workflows.data) {
    try {
      // Check if workflow already exists
      const { data: existingWorkflow, error: queryError } = await supabaseAdmin
        .from('instantly_integration.workflows')
        .select('id')
        .eq('workflow_id', workflow.id)
        .maybeSingle();
      
      if (queryError) {
        throw queryError;
      }
      
      // Extract workflow data
      const workflowData = {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        description: workflow.description || null,
        created_at: workflow.createdAt ? new Date(workflow.createdAt).toISOString() : null,
        updated_at: workflow.updatedAt ? new Date(workflow.updatedAt).toISOString() : null,
        status: workflow.active ? 'active' : 'inactive',
        is_active: workflow.active || false,
        tags: workflow.tags || [],
        raw_data: workflow
      };
      
      // Insert or update workflow
      if (existingWorkflow) {
        // Update existing
        const { error: updateError } = await supabaseAdmin
          .from('instantly_integration.workflows')
          .update(workflowData)
          .eq('workflow_id', workflow.id);
          
        if (updateError) {
          throw updateError;
        }
        
        results.updated++;
      } else {
        // Insert new
        const { error: insertError } = await supabaseAdmin
          .from('instantly_integration.workflows')
          .insert(workflowData);
          
        if (insertError) {
          throw insertError;
        }
        
        results.inserted++;
      }
    } catch (error: any) {
      console.error(`Error processing workflow ${workflow.id}:`, error);
      results.errors++;
      results.errorDetails.push(`${workflow.id}: ${error.message}`);
    }
  }
  
  // Update last_updated in config
  await supabaseAdmin
    .from('instantly_integration.config')
    .update({ last_updated: new Date().toISOString() })
    .eq('id', (await supabaseAdmin.from('instantly_integration.config').select('id').limit(1).single()).data?.id);
  
  return results;
}

// Update workflow in database only
async function updateWorkflow(data: any): Promise<any> {
  const { workflow_id, ...updateData } = data;
  
  if (!workflow_id) {
    throw new Error('Workflow ID is required');
  }
  
  const { data: result, error } = await supabaseAdmin
    .from('instantly_integration.workflows')
    .update(updateData)
    .eq('workflow_id', workflow_id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return result;
}

serve(handleRequest);
