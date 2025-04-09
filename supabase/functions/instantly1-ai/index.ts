
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Constants for Instantly API
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

// CORS headers for handling preflight and response headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error handler functions
function handleApiKeyError() {
  console.error('Instantly API key not configured');
  return new Response(
    JSON.stringify({ 
      error: 'Instantly API key not configured',
      message: 'Please configure the INSTANTLY_API_KEY in Supabase secrets'
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function handleParseError(error: Error) {
  console.error('Error parsing request body:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Invalid request body', 
      message: 'Could not parse the request JSON data'
    }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function handleUnknownAction(action: string) {
  return new Response(
    JSON.stringify({ error: `Unknown action: ${action}` }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function handleServerError(error: Error) {
  console.error('Error processing request:', error);
  return new Response(
    JSON.stringify({ 
      error: 'Internal server error', 
      message: error.message || 'An unexpected error occurred',
      stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handler for fetching campaigns
async function handleFetchCampaigns() {
  try {
    const response = await fetch(`${INSTANTLY_API_URL}/campaigns/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to fetch campaigns' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const campaigns = data.data.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
      metrics: {
        emailsSent: campaign.stats?.sent || 0,
        openRate: campaign.stats?.open_rate || 0,
        clickRate: campaign.stats?.click_rate || 0,
        conversionRate: campaign.stats?.conversion_rate || 0,
        replies: campaign.stats?.replies || 0,
      }
    }));

    return new Response(
      JSON.stringify({ campaigns }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaigns' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Handler for fetching campaign details
async function handleFetchCampaignDetails(campaignId: string) {
  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to fetch campaign details' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get daily stats for the campaign
    const statsResponse = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}/stats/daily`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const statsData = await statsResponse.json();
    
    const campaign = {
      id: data.data.id,
      name: data.data.name,
      status: data.data.status,
      created_at: data.data.created_at,
      updated_at: data.data.updated_at,
      metrics: {
        emailsSent: data.data.stats?.sent || 0,
        openRate: data.data.stats?.open_rate || 0,
        clickRate: data.data.stats?.click_rate || 0,
        conversionRate: data.data.stats?.conversion_rate || 0,
        replies: data.data.stats?.replies || 0,
        dailyStats: statsData.ok ? statsData.data.map((day: any) => ({
          date: day.date,
          sent: day.sent || 0,
          opened: day.opened || 0,
          clicked: day.clicked || 0,
          replied: day.replied || 0,
        })) : []
      }
    };

    return new Response(
      JSON.stringify({ campaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaign details' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Handler for refreshing metrics
async function handleRefreshMetrics() {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Use native fetch for database operations
    const { data: customerCampaigns, error: fetchError } = await fetch(
      `${supabaseUrl}/rest/v1/instantly_customer_campaigns?select=*`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      }
    ).then(res => res.json());
    
    if (fetchError) {
      console.error('Error fetching customer campaigns:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer campaigns', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    
    for (const campaign of customerCampaigns) {
      try {
        // Fetch latest campaign metrics from Instantly
        const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaign.campaign_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error(`Failed to fetch metrics for campaign ${campaign.campaign_id}:`, data);
          failureCount++;
          continue;
        }

        // Update campaign metrics in Supabase
        const updateResult = await fetch(
          `${supabaseUrl}/rest/v1/instantly_customer_campaigns?id=eq.${campaign.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              metrics: {
                emailsSent: data.data.stats?.sent || 0,
                openRate: data.data.stats?.open_rate || 0,
                clickRate: data.data.stats?.click_rate || 0,
                conversionRate: data.data.stats?.conversion_rate || 0,
                replies: data.data.stats?.replies || 0,
              },
              campaign_status: data.data.status,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!updateResult.ok) {
          console.error(`Failed to update campaign ${campaign.campaign_id}:`, await updateResult.text());
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${campaign.campaign_id}:`, error);
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Campaign metrics refreshed', 
        updatedCount: successCount, 
        failureCount 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error refreshing campaign metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refresh campaign metrics' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!INSTANTLY_API_KEY) {
      return handleApiKeyError();
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return handleParseError(error);
    }
    
    const { action, campaignId } = requestData;

    console.log(`Processing Instantly AI request: ${action}`);

    // Handle different actions
    switch (action) {
      case 'fetchCampaigns':
        return await handleFetchCampaigns();
      
      case 'fetchCampaignDetails':
        return await handleFetchCampaignDetails(campaignId);
      
      case 'refreshMetrics':
        return await handleRefreshMetrics();
      
      default:
        return handleUnknownAction(action);
    }
  } catch (error) {
    return handleServerError(error);
  }
});
