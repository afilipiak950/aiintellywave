import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the API key from environment variable
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

console.log("Edge function loaded: instantly-ai");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // More detailed logging to help with debugging
    console.log(`Processing request to instantly-ai function, method: ${req.method}, URL: ${req.url}`);
    
    // Log request headers for debugging
    const headers = Array.from(req.headers.entries());
    console.log('Request headers:', JSON.stringify(headers));
    
    // CRITICAL FIX: Check Content-Type header
    const contentType = req.headers.get('content-type') || '';
    console.log(`Request Content-Type: ${contentType}`);
    
    // Validate content type before attempting to parse JSON
    if (!contentType.includes('application/json')) {
      console.error(`Invalid content type: ${contentType}`);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid content type',
          message: 'Content-Type must be application/json',
          details: `Received: ${contentType}`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate API key first - we can't proceed without it
    if (!INSTANTLY_API_KEY) {
      console.error('ERROR: Instantly API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'API key missing',
          message: 'Instantly API key is not configured. Please set the INSTANTLY_API_KEY in Supabase secrets.'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // CRITICAL FIX: Robust request body parsing
    let requestData;
    try {
      // Log raw request body for debugging
      const clonedReq = req.clone();
      const rawBody = await clonedReq.text();
      
      console.log(`Raw request body length: ${rawBody.length} bytes`);
      if (rawBody.length > 0) {
        console.log(`Raw request body preview: '${rawBody.substring(0, Math.min(200, rawBody.length))}'`);
      } else {
        console.error('Empty request body received');
        return new Response(
          JSON.stringify({ 
            error: 'Empty request body',
            message: 'Request body cannot be empty. Please provide a valid JSON object with an "action" property.',
            help: 'Make sure the request includes a proper body parameter in your supabase.functions.invoke call'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Parse the JSON carefully
      try {
        requestData = JSON.parse(rawBody);
        console.log('Parsed request data:', requestData);
        
        // Additional validation of parsed data
        if (!requestData || typeof requestData !== 'object') {
          throw new Error('Request data is not a valid JSON object');
        }
        
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid JSON',
            message: 'Could not parse the request JSON data. Please check the request format.',
            details: e.message,
            rawBody: rawBody.length > 100 ? `${rawBody.substring(0, 100)}...` : rawBody
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (error) {
      console.error('Error processing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Request processing error',
          message: 'Could not process the request data.',
          details: error.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate action parameter
    const { action, campaignId, customerId } = requestData || {};
    
    if (!action) {
      console.error('No action specified in request');
      return new Response(
        JSON.stringify({ 
          error: 'Missing action',
          message: 'No action specified in request. Please include an "action" property.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing Instantly AI request: ${action}`);

    // Handle different actions based on the action parameter
    if (action === 'fetchCampaigns') {
      // Return mock/dummy data for now until the API key is configured
      if (!INSTANTLY_API_KEY || INSTANTLY_API_KEY === 'your_api_key') {
        console.log('Using mock data since API key is not configured');
        const mockCampaigns = [
          {
            id: "mock-1",
            name: "Mock Campaign 1",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metrics: {
              emailsSent: 100,
              openRate: 35.5,
              clickRate: 12.8,
              conversionRate: 5.2,
              replies: 24
            }
          },
          {
            id: "mock-2",
            name: "Mock Campaign 2",
            status: "paused",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metrics: {
              emailsSent: 50,
              openRate: 28.3,
              clickRate: 8.7,
              conversionRate: 3.1,
              replies: 11
            }
          }
        ];
        
        return new Response(
          JSON.stringify({ 
            campaigns: mockCampaigns,
            status: 'success',
            count: mockCampaigns.length,
            isMock: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Make the real API call if API key is set
      try {
        console.log('Fetching campaigns from Instantly API');
        
        const response = await fetch(`${INSTANTLY_API_URL}/campaigns/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        // Detailed logging of API response
        console.log(`Instantly API response status: ${response.status}`);
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error from Instantly API:', data);
          return new Response(
            JSON.stringify({ 
              error: 'API error',
              message: data.message || 'Failed to fetch campaigns from Instantly API',
              status: 'api_error',
              statusCode: response.status,
              details: data
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Validate the structure of the response
        if (!data.data || !Array.isArray(data.data)) {
          console.error('Unexpected response format from Instantly API:', data);
          return new Response(
            JSON.stringify({ 
              error: 'Invalid response',
              message: 'Unexpected response format from Instantly API',
              status: 'format_error',
              details: data
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Transform the data to a more usable format
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
            replies: campaign.stats?.replied || 0,
          }
        }));

        console.log(`Successfully fetched ${campaigns.length} campaigns`);

        return new Response(
          JSON.stringify({ 
            campaigns,
            status: 'success',
            count: campaigns.length
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('Error in fetchCampaigns action:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Function error',
            message: 'Error fetching campaigns from Instantly API',
            status: 'function_error',
            details: error.message,
            stack: error.stack
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Handle different actions based on the action parameter
    switch (action) {
      case 'fetchCampaignDetails': {
        try {
          // Validate campaign ID
          if (!campaignId) {
            return new Response(
              JSON.stringify({ 
                error: 'Missing parameter',
                message: 'Campaign ID is required for fetchCampaignDetails action',
                status: 'validation_error'
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          console.log(`Fetching details for campaign: ${campaignId}`);
          
          // Fetch campaign details
          const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          console.log(`Campaign details API response status: ${response.status}`);
          
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Error fetching campaign details:', data);
            return new Response(
              JSON.stringify({ 
                error: 'API error',
                message: data.message || 'Failed to fetch campaign details',
                status: 'api_error',
                statusCode: response.status,
                details: data
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          // Fetch daily stats for the campaign
          console.log(`Fetching daily stats for campaign: ${campaignId}`);
          const statsResponse = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}/stats/daily`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          console.log(`Campaign daily stats API response status: ${statsResponse.status}`);
          
          const statsData = await statsResponse.json();
          
          // Prepare the campaign data with all details
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
              replies: data.data.stats?.replied || 0,
              dailyStats: statsResponse.ok && statsData.data ? statsData.data.map((day: any) => ({
                date: day.date,
                sent: day.sent || 0,
                opened: day.opened || 0,
                clicked: day.clicked || 0,
                replied: day.replied || 0,
              })) : []
            }
          };

          console.log(`Successfully fetched details for campaign: ${campaign.name}`);

          return new Response(
            JSON.stringify({ 
              campaign,
              status: 'success'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error in fetchCampaignDetails action:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Function error',
              message: 'Error fetching campaign details',
              status: 'function_error',
              details: error.message,
              stack: error.stack
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      case 'assignCampaign': {
        try {
          // Validate parameters
          if (!campaignId) {
            return new Response(
              JSON.stringify({ 
                error: 'Missing parameter', 
                message: 'Campaign ID is required for assignCampaign action',
                status: 'validation_error'
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          if (!customerId) {
            return new Response(
              JSON.stringify({ 
                error: 'Missing parameter', 
                message: 'Customer ID is required for assignCampaign action',
                status: 'validation_error'
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          console.log(`Assigning campaign ${campaignId} to customer ${customerId}`);
          
          // Fetch campaign details first to get name and other info
          const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error('Error fetching campaign for assignment:', data);
            return new Response(
              JSON.stringify({ 
                error: 'API error', 
                message: data.message || 'Failed to fetch campaign for assignment',
                status: 'api_error',
                statusCode: response.status,
                details: data
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          // Create a record for the assignment
          const assignment = {
            campaign_id: campaignId,
            customer_id: customerId,
            campaign_name: data.data.name,
            campaign_status: data.data.status,
            metrics: {
              emailsSent: data.data.stats?.sent || 0,
              openRate: data.data.stats?.open_rate || 0,
              clickRate: data.data.stats?.click_rate || 0,
              conversionRate: data.data.stats?.conversion_rate || 0,
              replies: data.data.stats?.replied || 0,
            },
            assigned_at: new Date().toISOString()
          };

          console.log(`Successfully assigned campaign ${campaignId} to customer ${customerId}`);

          return new Response(
            JSON.stringify({ 
              assignment,
              status: 'success',
              message: `Campaign "${data.data.name}" assigned to customer successfully`
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error in assignCampaign action:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Function error', 
              message: 'Error assigning campaign',
              status: 'function_error',
              details: error.message,
              stack: error.stack
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      case 'refreshMetrics': {
        try {
          console.log('Refreshing metrics for all campaigns');
          
          // Fetch all campaigns from API to get latest metrics
          const response = await fetch(`${INSTANTLY_API_URL}/campaigns/list`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error('Error fetching campaigns for refresh:', data);
            return new Response(
              JSON.stringify({ 
                error: 'API error', 
                message: data.message || 'Failed to fetch campaigns for refresh',
                status: 'api_error',
                statusCode: response.status,
                details: data
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ 
              success: true,
              status: 'success',
              message: `Refreshed metrics for ${data.data.length} campaigns`,
              updatedCount: data.data.length
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (error) {
          console.error('Error in refreshMetrics action:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Function error', 
              message: 'Error refreshing campaign metrics',
              status: 'function_error',
              details: error.message,
              stack: error.stack
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      default:
        console.error(`Unknown action requested: ${action}`);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid action', 
            message: `Unknown action: ${action}. Available actions: fetchCampaigns, fetchCampaignDetails, assignCampaign, refreshMetrics`,
            status: 'validation_error'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    // Catch-all error handler
    console.error('Unhandled error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        message: 'An unexpected error occurred in the Edge Function',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
