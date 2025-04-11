import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Log the API Key existence and format (without leaking it)
const apiKey = Deno.env.get('INSTANTLY_API_KEY');
console.log(`API Key exists: ${!!apiKey}, Length: ${apiKey?.length}`);
if (apiKey) {
  console.log(`API Key format check: ${apiKey.substring(0, 4)}...`);
}

// Log all available environment variables (names only for security)
console.log('Available environment variables:', Object.keys(Deno.env.toObject()));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log(`Processing request: ${req.method} ${req.url}`);
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    console.log(`Auth header present: ${!!authHeader}`);
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Auth header starts with: ${authHeader.substring(0, 12)}`);
    
    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    
    console.log(`User data available: ${!!userData}`);
    
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token', details: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Authenticated user: ${userData.user.id}`);
    
    // Parse request body
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const action = requestData.action;
    console.log(`Processing Instantly AI request: ${action}`);
    
    // Check for API key
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`API Key exists and has length: ${apiKey.length}`);
    
    // Handle different actions
    switch (action) {
      case 'fetchCampaigns':
        return await handleFetchCampaigns(req);
        
      case 'getCampaignDetail':
        const campaignId = requestData.campaignId;
        return await handleGetCampaignDetail(campaignId);
        
      case 'updateCampaignTags':
        const { campaignId: tagCampaignId, tags } = requestData;
        return await handleUpdateCampaignTags(tagCampaignId, tags);
        
      case 'syncWorkflows':
        return await handleSyncWorkflows();
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error(`Error processing request: ${error.message}`, error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to fetch campaigns from the Instantly API
async function handleFetchCampaigns(req) {
  try {
    console.log('Fetching campaigns from Instantly API v2');
    
    // Build the API URL
    const apiUrl = 'https://api.instantly.ai/api/v2/campaigns?include_fields=all';
    console.log(`Making API request to: ${apiUrl}`);
    
    // Set up headers with API key
    console.log(`Using v2 API authentication format with X-API-KEY header and Bearer token`);
    const headers = {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'authorization': `Bearer ${apiKey}`
    };
    
    console.log('Request headers for API call:', Object.keys(headers));
    console.log(`Full X-API-KEY header value (first 4 chars): ${headers['X-API-KEY'].substring(0, 4)}`);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers
    });
    
    console.log(`Instantly API response status: ${response.status}`);
    console.log('Response headers:', await response.headers);
    
    // Handle error response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json();
    console.log('Raw response:', JSON.stringify(data));
    
    // Transform the response into a more useful format
    const campaigns = data.items.map(campaign => {
      // Extract basic information
      const result = {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        created_at: campaign.timestamp_created,
        updated_at: campaign.timestamp_updated,
        daily_limit: campaign.daily_limit || 50,
        email_list: campaign.email_list || [],
        statistics: {
          emailsSent: 0,
          opens: 0,
          replies: 0,
          bounces: 0,
          openRate: 0
        }
      };
      
      // Add additional data if available
      if (campaign.campaign_schedule) {
        result.schedule = campaign.campaign_schedule;
      }
      
      if (campaign.sequences) {
        result.sequences = campaign.sequences;
      }
      
      // Add email-specific features
      if (campaign.text_only !== undefined) result.text_only = campaign.text_only;
      if (campaign.stop_on_reply !== undefined) result.stop_on_reply = campaign.stop_on_reply;
      if (campaign.stop_on_auto_reply !== undefined) result.stop_on_auto_reply = campaign.stop_on_auto_reply;
      if (campaign.match_lead_esp !== undefined) result.match_lead_esp = campaign.match_lead_esp;
      
      return result;
    });
    
    console.log(`Successfully fetched ${campaigns.length} campaigns with complete data`);
    
    // Store campaigns in the database for persistence
    for (const campaign of campaigns) {
      try {
        // First check if we already have this campaign
        const { data: existingCampaign, error: checkError } = await supabaseClient
          .from('instantly_integration.campaigns')
          .select('id, tags')
          .eq('campaign_id', campaign.id)
          .maybeSingle();
        
        if (checkError) {
          console.warn(`Error checking campaign existence: ${checkError.message}`);
        }
        
        // Prepare campaign data for database
        const campaignData = {
          campaign_id: campaign.id,
          name: campaign.name,
          status: campaign.status.toString(),
          is_active: campaign.status === 1,
          statistics: campaign.statistics,
          raw_data: campaign,
          updated_at: new Date().toISOString()
        };
        
        if (existingCampaign) {
          // If it exists, update it but preserve tags
          const { error: updateError } = await supabaseClient
            .from('instantly_integration.campaigns')
            .update({
              ...campaignData,
              // Keep existing tags, this ensures we don't lose user's tag assignments
              tags: existingCampaign.tags 
            })
            .eq('campaign_id', campaign.id);
          
          if (updateError) {
            console.error(`Error updating campaign: ${updateError.message}`);
          }
        } else {
          // If it doesn't exist, insert it with empty tags
          const { error: insertError } = await supabaseClient
            .from('instantly_integration.campaigns')
            .insert({
              ...campaignData,
              tags: [],
              created_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error(`Error inserting campaign: ${insertError.message}`);
          }
        }
      } catch (error) {
        console.error(`Error storing campaign data for ${campaign.id}: ${error.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        campaigns,
        count: campaigns.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error fetching campaigns: ${error.message}`);
    
    // Try to get cached campaigns from our database as fallback
    try {
      const { data: dbCampaigns, error: dbError } = await supabaseClient
        .from('instantly_integration.campaigns')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (dbError) {
        throw dbError;
      }
      
      // If we have cached campaigns, return them
      if (dbCampaigns && dbCampaigns.length > 0) {
        console.log(`Returning ${dbCampaigns.length} cached campaigns from database`);
        
        // Format to match our API format
        const formattedCampaigns = dbCampaigns.map(db => ({
          id: db.campaign_id,
          name: db.name,
          status: db.status,
          created_at: db.created_at,
          updated_at: db.updated_at,
          tags: db.tags || [],
          statistics: db.statistics || {
            emailsSent: 0,
            opens: 0,
            replies: 0,
            bounces: 0,
            openRate: 0
          },
          // Add any additional data from raw_data
          ...(db.raw_data || {})
        }));
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            campaigns: formattedCampaigns,
            count: formattedCampaigns.length,
            status: 'fallback'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fallbackError) {
      console.error(`Fallback error: ${fallbackError.message}`);
    }
    
    // If all else fails, return some mock data
    return new Response(
      JSON.stringify({ 
        success: true, 
        campaigns: [
          {
            id: 'mock-id-1',
            name: 'Example Campaign (Offline Mode)',
            status: 'Offline',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: {
              emailsSent: 0,
              opens: 0,
              replies: 0,
              bounces: 0,
              openRate: 0
            },
            tags: ['offline', 'example']
          }
        ],
        count: 1,
        status: 'mock',
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Function to get details for a specific campaign
async function handleGetCampaignDetail(campaignId) {
  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    console.log(`Fetching details for campaign ID: ${campaignId}`);
    
    // Build the API URL
    const apiUrl = `https://api.instantly.ai/api/v2/campaigns/${campaignId}?include_fields=all`;
    console.log(`Making API request to: ${apiUrl}`);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log(`Campaign detail API response status: ${response.status}`);
    
    // Handle error response
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const campaignData = await response.json();
    console.log(`Raw response (truncated): ${JSON.stringify(campaignData).substring(0, 500)}...`);
    
    // Get tags from our database
    const { data: dbCampaign, error: dbError } = await supabaseClient
      .from('instantly_integration.campaigns')
      .select('tags')
      .eq('campaign_id', campaignId)
      .maybeSingle();
    
    if (dbError) {
      console.warn(`Error fetching campaign tags: ${dbError.message}`);
    }
    
    // Combine API data with our database data
    const campaign = {
      ...campaignData,
      tags: (dbCampaign && dbCampaign.tags) ? dbCampaign.tags : []
    };
    
    console.log(`Successfully fetched details for campaign ${campaignId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        campaign
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error fetching campaign details: ${error.message}`);
    
    // Try to get cached campaign from our database as fallback
    try {
      const { data: dbCampaign, error: dbError } = await supabaseClient
        .from('instantly_integration.campaigns')
        .select('*')
        .eq('campaign_id', campaignId)
        .maybeSingle();
      
      if (dbError) {
        throw dbError;
      }
      
      // If we have a cached campaign, return it
      if (dbCampaign) {
        console.log(`Returning cached campaign from database`);
        
        // Format to match our API format
        const campaign = {
          id: dbCampaign.campaign_id,
          name: dbCampaign.name,
          status: dbCampaign.status,
          tags: dbCampaign.tags || [],
          created_at: dbCampaign.created_at,
          updated_at: dbCampaign.updated_at,
          statistics: dbCampaign.statistics || {
            emailsSent: 0,
            opens: 0,
            replies: 0,
            bounces: 0,
            openRate: 0
          },
          // Add any additional data from raw_data
          ...(dbCampaign.raw_data || {})
        };
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            campaign,
            status: 'fallback'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (fallbackError) {
      console.error(`Fallback error: ${fallbackError.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Function to update tags for a campaign
async function handleUpdateCampaignTags(campaignId, tags) {
  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (!Array.isArray(tags)) {
    return new Response(
      JSON.stringify({ error: 'Tags must be an array' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // First check if the campaign exists in our database - use the correct schema
    console.log(`Checking if campaign ${campaignId} exists`);
    
    // Use the fully qualified table name with schema
    const { data: existingCampaign, error: checkError } = await supabaseClient
      .from('instantly_integration.campaigns')
      .select('id')
      .eq('campaign_id', campaignId)
      .maybeSingle();
    
    if (checkError) {
      console.error(`Error checking if campaign exists: ${checkError.message}`);
      
      // Return a clear error message
      return new Response(
        JSON.stringify({ 
          error: 'Database query error', 
          details: checkError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // If campaign doesn't exist yet, insert it first
    if (!existingCampaign) {
      console.log(`Campaign ${campaignId} not found in database, creating record first`);
      
      // Use the fully qualified table name with schema
      const { data: insertData, error: insertError } = await supabaseClient
        .from('instantly_integration.campaigns')
        .insert({ 
          campaign_id: campaignId,
          name: 'Campaign ' + campaignId.substring(0, 8),
          status: 'unknown',
          tags: tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          raw_data: {}
        });
      
      if (insertError) {
        console.error(`Error inserting campaign: ${insertError.message}`);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create campaign record', 
            details: insertError.message,
            hint: 'Please ensure the instantly_integration.campaigns table exists in the database.'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log(`Created new campaign record and set tags`);
    } else {
      // Update campaign tags
      console.log(`Updating tags for existing campaign: ${campaignId}`);
      
      // Use the fully qualified table name with schema
      const { data: updateData, error: updateError } = await supabaseClient
        .from('instantly_integration.campaigns')
        .update({ 
          tags,
          updated_at: new Date().toISOString() 
        })
        .eq('campaign_id', campaignId);
      
      if (updateError) {
        console.error(`Error updating campaign tags: ${updateError.message}`);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update campaign tags', 
            details: updateError.message 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log(`Updated tags for campaign: ${campaignId}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tags updated successfully',
        tags
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error updating campaign tags: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Function to sync workflows from the Instantly API
async function handleSyncWorkflows() {
  try {
    // This function is a placeholder
    console.log('Syncing workflows from Instantly API');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Workflow sync is not implemented yet',
        inserted: 0,
        updated: 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error syncing workflows: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
