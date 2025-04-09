import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
async function handleRequest(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from secrets
    const apiKey = Deno.env.get('INSTANTLY_API_KEY') || '';
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Initialize Supabase client with admin credentials
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Parse the request body
    const requestData = await req.json();
    const { action } = requestData;

    if (action === 'sync_workflows') {
      const response = await syncWorkflows(apiKey, supabaseAdmin);
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'sync_campaigns') {
      const response = await syncCampaigns(apiKey, supabaseAdmin);
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function syncWorkflows(apiKey: string, supabase: any) {
  const startTime = Date.now();
  
  try {
    // Log the API call start
    const { error: logError } = await supabase
      .from('instantly_integration.logs')
      .insert({
        endpoint: 'GET /workflows',
        status: 0,
        request_payload: { action: 'sync_workflows' }
      });
    
    if (logError) console.error('Error logging API call:', logError);
    
    // Fetch workflows from Instantly API
    const response = await fetch('https://api.instantly.ai/api/v1/workflows', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const responseData = await response.json();
    const duration = Date.now() - startTime;
    
    // Update the log with response data
    await supabase
      .from('instantly_integration.logs')
      .update({
        status: response.status,
        duration_ms: duration,
        response_payload: responseData,
        error_message: !response.ok ? JSON.stringify(responseData) : null
      })
      .eq('endpoint', 'GET /workflows')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const workflows = responseData.data;
    
    // Process each workflow
    let inserted = 0;
    let updated = 0;
    
    for (const workflow of workflows) {
      // Check if workflow exists
      const { data: existingWorkflow } = await supabase
        .from('instantly_integration.workflows')
        .select('id')
        .eq('workflow_id', workflow.id)
        .maybeSingle();
      
      const workflowData = {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        description: workflow.description || null,
        status: workflow.status,
        is_active: workflow.is_active || false,
        tags: workflow.tags || [],
        raw_data: workflow,
        updated_at: new Date().toISOString()
      };
      
      if (existingWorkflow) {
        // Update existing workflow
        const { error: updateError } = await supabase
          .from('instantly_integration.workflows')
          .update(workflowData)
          .eq('id', existingWorkflow.id);
        
        if (updateError) {
          console.error('Error updating workflow:', updateError);
        } else {
          updated++;
        }
      } else {
        // Insert new workflow
        const { error: insertError } = await supabase
          .from('instantly_integration.workflows')
          .insert({
            ...workflowData,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting workflow:', insertError);
        } else {
          inserted++;
        }
      }
    }
    
    // Update last sync time
    await supabase
      .from('instantly_integration.config')
      .update({ 
        last_updated: new Date().toISOString() 
      })
      .eq('api_key', apiKey);
    
    return {
      success: true,
      message: `Successfully synced ${workflows.length} workflows (${inserted} new, ${updated} updated)`,
      inserted,
      updated,
      total: workflows.length
    };
  } catch (error) {
    console.error('Error syncing workflows:', error);
    
    // Log the error
    await supabase
      .from('instantly_integration.logs')
      .update({
        status: 500,
        duration_ms: Date.now() - startTime,
        error_message: error.message
      })
      .eq('endpoint', 'GET /workflows')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    throw error;
  }
}

async function syncCampaigns(apiKey: string, supabase: any) {
  const startTime = Date.now();
  
  try {
    // Log the API call start
    const { error: logError } = await supabase
      .from('instantly_integration.logs')
      .insert({
        endpoint: 'GET /campaigns',
        status: 0,
        request_payload: { action: 'sync_campaigns' }
      });
    
    if (logError) console.error('Error logging API call:', logError);
    
    // Fetch campaigns from Instantly API
    const response = await fetch('https://api.instantly.ai/api/v1/campaigns', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const responseData = await response.json();
    const duration = Date.now() - startTime;
    
    // Update the log with response data
    await supabase
      .from('instantly_integration.logs')
      .update({
        status: response.status,
        duration_ms: duration,
        response_payload: responseData,
        error_message: !response.ok ? JSON.stringify(responseData) : null
      })
      .eq('endpoint', 'GET /campaigns')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const campaigns = responseData.data || [];
    
    // Process each campaign
    let inserted = 0;
    let updated = 0;
    
    for (const campaign of campaigns) {
      // Check if campaign exists
      const { data: existingCampaign } = await supabase
        .from('instantly_integration.campaigns')
        .select('id')
        .eq('campaign_id', campaign.id)
        .maybeSingle();
      
      const campaignData = {
        campaign_id: campaign.id,
        name: campaign.name,
        description: campaign.description || null,
        status: campaign.status,
        is_active: campaign.is_active || false,
        tags: campaign.tags || [],
        statistics: campaign.statistics || {},
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString() : null,
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString() : null,
        raw_data: campaign,
        updated_at: new Date().toISOString()
      };
      
      if (existingCampaign) {
        // Update existing campaign
        const { error: updateError } = await supabase
          .from('instantly_integration.campaigns')
          .update(campaignData)
          .eq('id', existingCampaign.id);
        
        if (updateError) {
          console.error('Error updating campaign:', updateError);
        } else {
          updated++;
        }
      } else {
        // Insert new campaign
        const { error: insertError } = await supabase
          .from('instantly_integration.campaigns')
          .insert({
            ...campaignData,
            created_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error inserting campaign:', insertError);
        } else {
          inserted++;
        }
      }
    }
    
    // Update last sync time
    await supabase
      .from('instantly_integration.config')
      .update({ 
        last_updated: new Date().toISOString() 
      })
      .eq('api_key', apiKey);
    
    return {
      success: true,
      message: `Successfully synced ${campaigns.length} campaigns (${inserted} new, ${updated} updated)`,
      inserted,
      updated,
      total: campaigns.length
    };
  } catch (error) {
    console.error('Error syncing campaigns:', error);
    
    // Log the error
    await supabase
      .from('instantly_integration.logs')
      .update({
        status: 500,
        duration_ms: Date.now() - startTime,
        error_message: error.message
      })
      .eq('endpoint', 'GET /campaigns')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    throw error;
  }
}

serve(handleRequest);
