
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { supabaseClient } from "./supabase.ts";

// Constants for Instantly API
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

// CORS headers for handling preflight and response headers
const standardHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!INSTANTLY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Instantly API key not configured' }),
        { status: 500, headers: standardHeaders }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { action, campaignId, customerId } = requestData;

    console.log(`Processing Instantly AI request: ${action}`);

    // Handle different actions
    switch (action) {
      case 'fetchCampaigns':
        return await fetchCampaigns();
      
      case 'fetchCampaignDetails':
        return await fetchCampaignDetails(campaignId);
      
      case 'assignCampaign':
        return await assignCampaignToCustomer(campaignId, customerId);
      
      case 'refreshMetrics':
        return await refreshCampaignMetrics();
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: standardHeaders }
        );
    }
  } catch (error) {
    console.error('Instantly AI Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: standardHeaders }
    );
  }
});

// Fetch all campaigns from Instantly
async function fetchCampaigns() {
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
        { status: response.status, headers: standardHeaders }
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
      { headers: standardHeaders }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaigns' }),
      { status: 500, headers: standardHeaders }
    );
  }
}

// Fetch campaign details from Instantly
async function fetchCampaignDetails(campaignId: string) {
  if (!campaignId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID is required' }),
      { status: 400, headers: standardHeaders }
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
        { status: response.status, headers: standardHeaders }
      );
    }

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
      }
    };

    return new Response(
      JSON.stringify({ campaign }),
      { headers: standardHeaders }
    );
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch campaign details' }),
      { status: 500, headers: standardHeaders }
    );
  }
}

// Assign a campaign to a customer
async function assignCampaignToCustomer(campaignId: string, customerId: string) {
  if (!campaignId || !customerId) {
    return new Response(
      JSON.stringify({ error: 'Campaign ID and Customer ID are required' }),
      { status: 400, headers: standardHeaders }
    );
  }

  try {
    // First, fetch campaign details to get name and status
    const detailsResponse = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const detailsData = await detailsResponse.json();
    
    if (!detailsResponse.ok) {
      return new Response(
        JSON.stringify({ error: detailsData.message || 'Failed to fetch campaign details' }),
        { status: detailsResponse.status, headers: standardHeaders }
      );
    }

    // Insert campaign assignment into Supabase
    const { data, error } = await supabaseClient
      .from('instantly_customer_campaigns')
      .insert({
        customer_id: customerId,
        campaign_id: campaignId,
        campaign_name: detailsData.data.name,
        campaign_status: detailsData.data.status,
        metrics: {
          emailsSent: detailsData.data.stats?.sent || 0,
          openRate: detailsData.data.stats?.open_rate || 0,
          clickRate: detailsData.data.stats?.click_rate || 0,
          conversionRate: detailsData.data.stats?.conversion_rate || 0,
          replies: detailsData.data.stats?.replies || 0,
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase assignment error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to assign campaign', details: error.message }),
        { status: 500, headers: standardHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Campaign assigned successfully', 
        assignment: data 
      }),
      { headers: standardHeaders }
    );
  } catch (error) {
    console.error('Error assigning campaign:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to assign campaign' }),
      { status: 500, headers: standardHeaders }
    );
  }
}

// Refresh metrics for all campaigns
async function refreshCampaignMetrics() {
  try {
    // Fetch all customer campaigns from Supabase
    const { data: customerCampaigns, error: fetchError } = await supabaseClient
      .from('instantly_customer_campaigns')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching customer campaigns:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch customer campaigns', details: fetchError.message }),
        { status: 500, headers: standardHeaders }
      );
    }

    let successCount = 0;
    let failureCount = 0;
    const updatePromises = customerCampaigns.map(async (campaign) => {
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
          return;
        }

        // Update campaign metrics in Supabase
        const { error: updateError } = await supabaseClient
          .from('instantly_customer_campaigns')
          .update({
            metrics: {
              emailsSent: data.data.stats?.sent || 0,
              openRate: data.data.stats?.open_rate || 0,
              clickRate: data.data.stats?.click_rate || 0,
              conversionRate: data.data.stats?.conversion_rate || 0,
              replies: data.data.stats?.replies || 0,
            },
            campaign_status: data.data.status
          })
          .eq('id', campaign.id);

        if (updateError) {
          console.error(`Failed to update campaign ${campaign.campaign_id}:`, updateError);
          failureCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing campaign ${campaign.campaign_id}:`, error);
        failureCount++;
      }
    });

    await Promise.allSettled(updatePromises);

    return new Response(
      JSON.stringify({ 
        message: 'Campaign metrics refreshed', 
        successCount, 
        failureCount 
      }),
      { headers: standardHeaders }
    );
  } catch (error) {
    console.error('Error refreshing campaign metrics:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to refresh campaign metrics' }),
      { status: 500, headers: standardHeaders }
    );
  }
}
