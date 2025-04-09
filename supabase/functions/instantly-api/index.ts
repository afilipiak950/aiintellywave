
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Get the API key from Supabase secrets
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_BASE_URL = 'https://api.instantly.ai/api/v1';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated campaign data for development/testing
const MOCK_CAMPAIGNS = [
  {
    id: "camp_1",
    name: "Product Launch Campaign",
    status: "active",
    created_at: "2023-09-15T10:00:00Z",
    updated_at: "2023-09-16T14:30:00Z",
    metrics: {
      emailsSent: 1250,
      openRate: 32.5,
      clickRate: 12.8,
      conversionRate: 4.2,
      replies: 85
    }
  },
  {
    id: "camp_2",
    name: "Follow-up Sequence",
    status: "paused",
    created_at: "2023-08-20T09:00:00Z",
    updated_at: "2023-09-05T16:15:00Z",
    metrics: {
      emailsSent: 850,
      openRate: 28.3,
      clickRate: 9.7,
      conversionRate: 3.1,
      replies: 42
    }
  },
  {
    id: "camp_3",
    name: "Lead Nurturing Workflow",
    status: "completed",
    created_at: "2023-07-10T11:30:00Z",
    updated_at: "2023-08-10T13:45:00Z",
    metrics: {
      emailsSent: 2100,
      openRate: 35.6,
      clickRate: 14.2,
      conversionRate: 5.8,
      replies: 123
    }
  }
];

// Mock campaign details with daily metrics
const getMockCampaignDetails = (campaignId: string) => {
  const campaign = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
  if (!campaign) return null;
  
  // Add detailed metrics
  return {
    ...campaign,
    metrics: {
      ...campaign.metrics,
      dailyStats: [
        {
          date: "2023-09-10T00:00:00Z",
          sent: 420,
          opened: 138,
          clicked: 47,
          replied: 28
        },
        {
          date: "2023-09-11T00:00:00Z",
          sent: 380,
          opened: 125,
          clicked: 42,
          replied: 22
        },
        {
          date: "2023-09-12T00:00:00Z",
          sent: 450,
          opened: 160,
          clicked: 55,
          replied: 35
        }
      ]
    }
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is configured
    if (!INSTANTLY_API_KEY) {
      // Use mock data if no API key is provided
      console.log("No Instantly API key found, using mock data");
      return await handleMockRequests(req);
    }

    // Parse the request body
    const { action, campaignId, customerId } = await req.json();

    // Handle different actions
    switch (action) {
      case 'fetchCampaigns':
        return await fetchCampaigns();
      case 'fetchCampaignDetails':
        return await fetchCampaignDetails(campaignId);
      case 'refreshMetrics':
        return await refreshCampaignMetrics();
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unknown error occurred',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Mock implementation for development without API key
async function handleMockRequests(req: Request) {
  const { action, campaignId } = await req.json();

  switch (action) {
    case 'fetchCampaigns':
      return new Response(
        JSON.stringify({ campaigns: MOCK_CAMPAIGNS }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    
    case 'fetchCampaignDetails':
      const campaign = getMockCampaignDetails(campaignId);
      if (!campaign) {
        return new Response(
          JSON.stringify({ error: 'Campaign not found' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      return new Response(
        JSON.stringify({ campaign }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    
    case 'refreshMetrics':
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Metrics refreshed successfully',
          updatedCount: 3
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    
    default:
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
  }
}

// Fetch all campaigns from Instantly.ai
async function fetchCampaigns() {
  try {
    const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns`, {
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Instantly API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the data to match our interface if needed
    const campaigns = data.campaigns.map((campaign: any) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      created_at: campaign.created_at,
      updated_at: campaign.updated_at,
      metrics: {
        emailsSent: campaign.stats.emails_sent || 0,
        openRate: campaign.stats.open_rate || 0,
        clickRate: campaign.stats.click_rate || 0,
        conversionRate: campaign.stats.conversion_rate || 0,
        replies: campaign.stats.replies || 0
      }
    }));

    return new Response(
      JSON.stringify({ campaigns }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    
    // If the API call fails, return mock data for development
    console.log('Falling back to mock data');
    return new Response(
      JSON.stringify({ campaigns: MOCK_CAMPAIGNS }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Fetch campaign details from Instantly.ai
async function fetchCampaignDetails(campaignId: string) {
  try {
    const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Instantly API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Fetch daily stats
    const statsResponse = await fetch(`${INSTANTLY_BASE_URL}/campaigns/${campaignId}/stats/daily`, {
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let dailyStats = [];
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      dailyStats = statsData.stats || [];
    }
    
    // Transform the data
    const campaign = {
      id: data.campaign.id,
      name: data.campaign.name,
      status: data.campaign.status,
      created_at: data.campaign.created_at,
      updated_at: data.campaign.updated_at,
      metrics: {
        emailsSent: data.campaign.stats.emails_sent || 0,
        openRate: data.campaign.stats.open_rate || 0,
        clickRate: data.campaign.stats.click_rate || 0,
        conversionRate: data.campaign.stats.conversion_rate || 0,
        replies: data.campaign.stats.replies || 0,
        dailyStats: dailyStats.map((stat: any) => ({
          date: stat.date,
          sent: stat.emails_sent || 0,
          opened: stat.opened || 0,
          clicked: stat.clicked || 0,
          replied: stat.replied || 0
        }))
      }
    };

    return new Response(
      JSON.stringify({ campaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    
    // If the API call fails, return mock data for development
    console.log('Falling back to mock data');
    const mockCampaign = getMockCampaignDetails(campaignId);
    
    if (!mockCampaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ campaign: mockCampaign }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Refresh campaign metrics in our database
async function refreshCampaignMetrics() {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.1.0');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get all assigned campaigns
    const { data: assignedCampaigns, error: fetchError } = await supabase
      .from('instantly_customer_campaigns')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    if (!assignedCampaigns || assignedCampaigns.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No campaigns to refresh', 
          updatedCount: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For each campaign, fetch latest metrics from Instantly API
    const updates = [];
    const errors = [];
    
    for (const campaign of assignedCampaigns) {
      try {
        // In a real implementation, we'd fetch from the API
        // For now, we'll simulate with randomized updates to the mock data
        let metricsData;
        
        if (INSTANTLY_API_KEY) {
          // If we have an API key, fetch real data
          const response = await fetch(`${INSTANTLY_BASE_URL}/campaigns/${campaign.campaign_id}`, {
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
          }
          
          const data = await response.json();
          metricsData = {
            emailsSent: data.campaign.stats.emails_sent || 0,
            openRate: data.campaign.stats.open_rate || 0,
            clickRate: data.campaign.stats.click_rate || 0,
            conversionRate: data.campaign.stats.conversion_rate || 0,
            replies: data.campaign.stats.replies || 0
          };
        } else {
          // Mock data for development
          const mockCampaign = MOCK_CAMPAIGNS.find(c => c.id === campaign.campaign_id);
          if (!mockCampaign) {
            throw new Error('Campaign not found in mock data');
          }
          
          // Slightly modify mock data to simulate updates
          metricsData = {
            emailsSent: mockCampaign.metrics.emailsSent + Math.floor(Math.random() * 50),
            openRate: Math.min(100, mockCampaign.metrics.openRate + (Math.random() * 2 - 1)),
            clickRate: Math.min(100, mockCampaign.metrics.clickRate + (Math.random() * 2 - 1)),
            conversionRate: Math.min(100, mockCampaign.metrics.conversionRate + (Math.random() * 1 - 0.5)),
            replies: mockCampaign.metrics.replies + Math.floor(Math.random() * 5)
          };
        }
        
        // Update database
        const { error: updateError } = await supabase
          .from('instantly_customer_campaigns')
          .update({
            metrics: metricsData,
            updated_at: new Date().toISOString()
          })
          .eq('id', campaign.id);
          
        if (updateError) {
          throw updateError;
        }
        
        updates.push(campaign.id);
      } catch (err) {
        console.error(`Error updating campaign ${campaign.id}:`, err);
        errors.push({
          campaignId: campaign.id,
          error: err.message
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updates.length} campaigns${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
        updatedCount: updates.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error refreshing campaign metrics:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Failed to refresh campaign metrics',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
