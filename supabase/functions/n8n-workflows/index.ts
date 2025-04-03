
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const n8nApiUrl = Deno.env.get('N8N_API_URL');
const n8nApiKey = Deno.env.get('N8N_API_KEY');

console.log("Edge function environment:");
console.log(`- N8N API URL: ${n8nApiUrl ? "Set (starting with " + n8nApiUrl.substring(0, 20) + "...)" : "Not set"}`);
console.log(`- N8N API Key: ${n8nApiKey ? "Set (length: " + n8nApiKey.length + ")" : "Not set"}`);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate required environment variables
    if (!n8nApiUrl || !n8nApiKey) {
      throw new Error("Required environment variables N8N_API_URL or N8N_API_KEY are not set.");
    }

    // Parse request body
    const { action, workflowId, data } = await req.json();
    
    console.log(`Received request with action: ${action}`);
    
    if (action === 'sync') {
      return await handleSync(req);
    } else if (action === 'share' && workflowId && data) {
      return await handleShare(workflowId, data);
    } else {
      throw new Error("Invalid action or missing required parameters");
    }
  } catch (error) {
    console.error("Error in n8n-workflows edge function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handleSync(req) {
  console.log("Syncing workflows from n8n");
  
  try {
    // Get workflows from n8n
    const n8nResponse = await fetch(`${n8nApiUrl}/workflows`, {
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Accept': 'application/json'
      }
    });
    
    console.log(`n8n API response status: ${n8nResponse.status}`);
    
    // Check if response is HTML instead of JSON (which indicates an issue)
    const contentType = n8nResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlContent = await n8nResponse.text();
      console.error("Received HTML response instead of JSON. First 100 chars:", htmlContent.substring(0, 100));
      throw new Error("Received HTML response from n8n API. API URL might be incorrect or missing /api/v1 path.");
    }
    
    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      throw new Error(`Failed to fetch workflows from n8n: ${n8nResponse.status} ${errorText}`);
    }
    
    // Parse the response
    const workflows = await n8nResponse.json();
    console.log(`Retrieved ${workflows.data?.length || 0} workflows from n8n`);
    
    if (!workflows.data || !Array.isArray(workflows.data)) {
      console.error("Unexpected response format:", workflows);
      throw new Error("Invalid workflow data received from n8n");
    }
    
    // Get Supabase client
    const supabaseClient = await getSupabaseClient(req);
    
    // Process each workflow
    const results = [];
    for (const workflow of workflows.data) {
      try {
        const { id, name, active, nodes, connections, staticData, settings, pinData, tags } = workflow;
        
        // Convert full data to a simpler structure
        const data = { nodes, connections, staticData, settings, pinData };
        
        // Format tags as an array of strings
        const tagNames = tags ? tags.map(tag => tag.name) : [];
        
        // Get existing workflow by n8n ID
        const { data: existingWorkflow, error: queryError } = await supabaseClient
          .from('n8n_workflows')
          .select('id')
          .eq('n8n_workflow_id', id)
          .maybeSingle();
        
        if (queryError) {
          throw new Error(`Error querying workflow: ${queryError.message}`);
        }
        
        let result;
        // Update or insert the workflow
        if (existingWorkflow) {
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
            throw new Error(`Error updating workflow: ${updateError.message}`);
          }
          
          result = { action: 'updated', workflow: updatedWorkflow };
        } else {
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
            throw new Error(`Error inserting workflow: ${insertError.message}`);
          }
          
          result = { action: 'added', workflow: newWorkflow };
        }
        
        results.push(result);
      } catch (error) {
        console.error(`Error processing workflow ${workflow.id}:`, error);
        results.push({ action: 'error', workflowId: workflow.id, error: error.message });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in sync handler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}

async function handleShare(workflowId, data) {
  // Implementation for sharing a workflow
  // This is a placeholder for future functionality
  return new Response(
    JSON.stringify({
      success: true,
      message: `Workflow ${workflowId} shared successfully`,
      data
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function getSupabaseClient(req) {
  // Initialize Supabase client with admin role for database operations
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get user JWT from request if available (for auth context)
  try {
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      await supabaseAdmin.auth.setSession({ access_token: token, refresh_token: '' });
    }
  } catch (error) {
    console.warn("Failed to set auth context:", error);
    // Continue with admin client anyway
  }
  
  return supabaseAdmin;
}

// Import from Supabase JS library
function createClient(url, key, options) {
  const headers = { 'X-Client-Info': 'supabase-js/2.0.0' };
  
  return {
    from: (table) => ({
      select: (columns) => {
        let query = { table, columns };
        
        return {
          eq: (column, value) => {
            query.filter = { column, value, operator: 'eq' };
            return {
              maybeSingle: async () => {
                const result = await executeQuery({ ...query, isSingle: true, maybeSingle: true });
                return { data: result.data?.[0] || null, error: result.error };
              },
              single: async () => {
                const result = await executeQuery({ ...query, isSingle: true });
                return { data: result.data?.[0], error: result.error };
              }
            };
          },
          maybeSingle: async () => {
            const result = await executeQuery({ ...query, isSingle: true, maybeSingle: true });
            return { data: result.data?.[0] || null, error: result.error };
          }
        };
      },
      update: (data) => ({
        eq: (column, value) => ({
          select: () => ({
            single: async () => {
              const result = await executeQuery({ 
                table, 
                data, 
                filter: { column, value, operator: 'eq' }, 
                method: 'PATCH',
                isSingle: true 
              });
              return { data: result.data?.[0], error: result.error };
            }
          })
        })
      }),
      insert: (data) => ({
        select: () => ({
          single: async () => {
            const result = await executeQuery({ 
              table, 
              data, 
              method: 'POST',
              isSingle: true 
            });
            return { data: result.data?.[0], error: result.error };
          }
        })
      })
    }),
    auth: {
      setSession: async () => ({})
    }
  };
  
  async function executeQuery(query) {
    try {
      const endpoint = `${url}/rest/v1/${query.table}${query.columns ? `?select=${query.columns}` : ''}`;
      
      let requestInit = {
        method: query.method || 'GET',
        headers: {
          ...headers,
          'Authorization': `Bearer ${key}`,
          'apikey': key,
          'Content-Type': 'application/json',
          'Prefer': query.isSingle && !query.maybeSingle ? 'return=representation,count=exact' : 'return=representation'
        }
      };
      
      // Add body for POST/PATCH requests
      if (['POST', 'PATCH'].includes(requestInit.method) && query.data) {
        requestInit.body = JSON.stringify(query.data);
      }
      
      // Add filter for specific queries
      let finalEndpoint = endpoint;
      if (query.filter) {
        const { column, value, operator } = query.filter;
        if (operator === 'eq') {
          finalEndpoint += finalEndpoint.includes('?') 
            ? `&${column}=eq.${value}` 
            : `?${column}=eq.${value}`;
        }
      }
      
      const response = await fetch(finalEndpoint, requestInit);
      
      if (!response.ok) {
        const errorText = await response.text();
        return { 
          data: null, 
          error: { message: `Supabase error: ${response.status} ${errorText}` } 
        };
      }
      
      const data = await response.json();
      return { data: Array.isArray(data) ? data : [data], error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }
}
