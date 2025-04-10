
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";

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
    // Detailed logging of the request
    console.log(`Processing request: ${req.method} ${req.url}`);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Parse the request body
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const { action, campaignId, customerId } = requestData || {};
    
    if (!action) {
      console.error('No action specified in request');
      return new Response(
        JSON.stringify({ 
          error: 'Missing action',
          message: 'No action parameter specified in request'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate API key availability
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

    console.log(`Processing Instantly AI request: ${action}`);

    // Handle fetchCampaigns action
    if (action === 'fetchCampaigns') {
      try {
        console.log('Fetching campaigns from Instantly API');
        console.log('Using API Key:', INSTANTLY_API_KEY ? 'API key present (hidden for security)' : 'No API key');
        
        // Fix: Update the API endpoint from /campaigns/list to /campaign/list
        const response = await fetch(`${INSTANTLY_API_URL}/campaign/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        console.log(`Instantly API response status: ${response.status}`);
        
        // Try to parse the response as JSON
        let data;
        try {
          const textResponse = await response.text();
          console.log('Raw response:', textResponse);
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          return new Response(
            JSON.stringify({ 
              error: 'API response parsing error',
              message: 'Failed to parse response from Instantly API',
              details: parseError.message
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        if (!response.ok) {
          console.error('Error from Instantly API:', data);
          return new Response(
            JSON.stringify({ 
              error: 'API error',
              message: data.message || 'Failed to fetch campaigns from Instantly API',
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
          statistics: {
            emailsSent: campaign.stats?.sent || 0,
            openRate: campaign.stats?.open_rate || 0,
            replies: campaign.stats?.replied || 0
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
      } catch (error: any) {
        console.error('Error in fetchCampaigns action:', error);
        
        // Provide mock data as fallback when real API fails
        console.log('Providing mock data as fallback since API call failed');
        const mockCampaigns = [
          {
            id: "mock-1",
            name: "LinkedIn Outreach - Q2",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 1250, openRate: 32.4, replies: 78 }
          },
          {
            id: "mock-2",
            name: "Welcome Sequence - New Leads",
            status: "active", 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 875, openRate: 45.8, replies: 124 }
          },
          {
            id: "mock-3",
            name: "Product Announcement - Enterprise",
            status: "scheduled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 0, openRate: 0, replies: 0 }
          },
          {
            id: "mock-4",
            name: "Follow-up - Sales Qualified Leads",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 520, openRate: 28.5, replies: 42 }
          },
          {
            id: "mock-5",
            name: "Re-engagement - Inactive Customers",
            status: "paused",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 1890, openRate: 15.2, replies: 63 }
          },
          {
            id: "mock-6",
            name: "Event Invitation - Annual Conference",
            status: "completed",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 3200, openRate: 38.9, replies: 245 }
          },
          {
            id: "mock-7",
            name: "Customer Feedback Request",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 750, openRate: 42.1, replies: 187 }
          },
          {
            id: "mock-8",
            name: "Onboarding Sequence - New Users",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 425, openRate: 51.3, replies: 96 }
          }
        ];
        
        return new Response(
          JSON.stringify({ 
            campaigns: mockCampaigns,
            status: 'fallback',
            message: 'API connection failed, using fallback data',
            count: mockCampaigns.length,
            error: error.message
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Handle other actions
    return new Response(
      JSON.stringify({ 
        error: 'Invalid action', 
        message: `Unknown action: ${action}. Available actions: fetchCampaigns`
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    // Catch-all error handler
    console.error('Unhandled error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        message: 'An unexpected error occurred in the Edge Function',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
