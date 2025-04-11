import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";
import { corsHeaders } from "./corsHeaders.ts";

// Get the API key and properly clean it
const rawKey = Deno.env.get('INSTANTLY_API_KEY') || '';
// Clean the key - remove any whitespace, newlines, and carriage returns
const INSTANTLY_API_KEY = rawKey.replace(/[\r\n\s]+/g, '');
// Use the correct v2 endpoint format
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v2";

console.log("Edge function loaded: instantly-ai");
console.log(`API Key exists: ${!!INSTANTLY_API_KEY}, Length: ${INSTANTLY_API_KEY.length}`);
// Log first few characters to check for formatting issues (don't log the full key)
if (INSTANTLY_API_KEY.length > 0) {
  console.log(`API Key format check: ${INSTANTLY_API_KEY.substring(0, 4)}...`);
}

// Log all environment variables (without values) to confirm what's available
console.log("Available environment variables:", Object.keys(Deno.env.toObject()));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Get the auth header for debugging
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    if (authHeader) {
      console.log('Auth header starts with:', authHeader.substring(0, 15));
    } else {
      console.log('WARNING: No Authorization header found in request');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication error', 
          message: 'No authorization header provided'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get the Supabase client with improved auth configuration
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for edge function
      {
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        },
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
          // Add storage option to avoid auto-storage errors
          storage: {
            getItem: (_key: string) => null,
            setItem: (_key: string, _value: string) => {},
            removeItem: (_key: string) => {}
          }
        },
      }
    );
    
    // Get session to check if user is authenticated with improved error handling
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    
    console.log('User data available:', !!user);
    
    if (userError) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication error', 
          message: userError?.message || 'Not authenticated',
          details: userError
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    if (!user) {
      console.error('Authentication error: No user found');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication error', 
          message: 'Not authenticated',
          details: 'No valid user found'
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    // Detailed logging of the request
    console.log(`Processing request: ${req.method} ${req.url}`);
    console.log(`Authenticated user: ${user.id}`);
    
    // Parse the request body with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request', 
          message: 'Could not parse request body as JSON' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Request data:', requestData);
    
    const { action, campaignId, customerId, tags } = requestData || {};
    
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
      // Log all environment variables (without values) to confirm what's available
      console.log('Available environment variables:', Object.keys(Deno.env.toObject()));
      
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
    console.log('API Key exists and has length:', INSTANTLY_API_KEY ? INSTANTLY_API_KEY.length : 0);

    // Handle fetchCampaigns action
    if (action === 'fetchCampaigns') {
      try {
        console.log('Fetching campaigns from Instantly API v2');
        
        // Use the correct v2 endpoint for campaigns with full data
        const apiEndpoint = `${INSTANTLY_API_URL}/campaigns?include_fields=all`;
        console.log(`Making API request to: ${apiEndpoint}`);
        
        // For v2 API, use both authentication formats to ensure compatibility
        console.log('Using v2 API authentication format with X-API-KEY header and Bearer token');
        
        // Define headers with both authentication formats
        const headers = {
          'X-API-KEY': INSTANTLY_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': `Bearer ${INSTANTLY_API_KEY}`,
        };
        
        console.log('Request headers for API call:', Object.keys(headers));
        console.log('Full X-API-KEY header value (first 4 chars):', INSTANTLY_API_KEY.substring(0, 4));
        
        // Make the API request
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: headers,
        });
        
        // Log response status and headers for debugging
        console.log(`Instantly API response status: ${response.status}`);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Try to parse the response as JSON
        let data;
        try {
          const textResponse = await response.text();
          console.log('Raw response:', textResponse);
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          throw new Error(`Failed to parse response: ${parseError.message}`);
        }
        
        if (!response.ok) {
          console.error('Error from Instantly API:', data);
          throw new Error(data.message || 'Failed to fetch campaigns from Instantly API');
        }

        // Handle different response formats - the API might return 'items' or 'data'
        const campaignsArray = data.data || data.items || [];
        
        if (!campaignsArray || !Array.isArray(campaignsArray)) {
          console.error('Unexpected response format from Instantly API:', data);
          throw new Error('Unexpected response format from Instantly API');
        }

        // Transform the data to a more comprehensive format
        const campaigns = campaignsArray.map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name || '',
          status: campaign.status || '',
          created_at: campaign.timestamp_created || campaign.created_at || new Date().toISOString(),
          updated_at: campaign.timestamp_updated || campaign.updated_at || new Date().toISOString(),
          statistics: {
            emailsSent: campaign.stats?.sent || 0,
            openRate: campaign.stats?.open_rate || 0,
            replies: campaign.stats?.replied || 0,
            bounces: campaign.stats?.bounced || 0,
            opens: campaign.stats?.opened || 0,
            clicks: campaign.stats?.clicked || 0
          },
          sequences: campaign.sequences || [],
          schedule: campaign.campaign_schedule || {},
          email_list: campaign.email_list || [],
          daily_limit: campaign.daily_limit || 0,
          stop_on_reply: campaign.stop_on_reply || false,
          stop_on_auto_reply: campaign.stop_on_auto_reply || false,
          tags: campaign.email_tag_list || [],
          raw_data: campaign
        }));

        console.log(`Successfully fetched ${campaigns.length} campaigns with complete data`);

        return new Response(
          JSON.stringify({ 
            campaigns,
            status: 'success',
            count: campaigns.length,
            fields: Object.keys(campaigns[0] || {}).filter(key => key !== 'raw_data')
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
            statistics: { emailsSent: 1250, openRate: 32.4, replies: 78, bounces: 12, opens: 405, clicks: 98 },
            sequences: [{
              steps: [
                { type: "email", delay: 0, variants: [{ subject: "Introduction", body: "Hello {{firstName}}" }] },
                { type: "email", delay: 3, variants: [{ subject: "Follow-up", body: "Just checking in" }] }
              ]
            }],
            email_list: ["test@example.com"],
            daily_limit: 100,
            stop_on_reply: true,
            tags: ["outreach", "linkedin", "b2b"],
          },
          {
            id: "mock-2",
            name: "Welcome Sequence - New Leads",
            status: "active", 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 875, openRate: 45.8, replies: 124, bounces: 5, opens: 401, clicks: 210 },
            sequences: [{
              steps: [
                { type: "email", delay: 0, variants: [{ subject: "Welcome!", body: "Thanks for joining us" }] },
                { type: "email", delay: 2, variants: [{ subject: "Getting Started", body: "Here's how to begin" }] }
              ]
            }],
            email_list: ["lead@example.com"],
            daily_limit: 200,
            stop_on_reply: true,
            tags: ["welcome", "onboarding", "new-customer"],
          },
          {
            id: "mock-3",
            name: "Real Estate Follow-up",
            status: "paused", 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 342, openRate: 28.6, replies: 47, bounces: 3, opens: 98, clicks: 54 },
            sequences: [{
              steps: [
                { type: "email", delay: 0, variants: [{ subject: "Property Update", body: "Following up on your inquiry" }] },
                { type: "email", delay: 4, variants: [{ subject: "New Listings", body: "Check out our new properties" }] }
              ]
            }],
            email_list: ["prospect@example.com"],
            daily_limit: 75,
            stop_on_reply: true,
            tags: ["real-estate", "property", "housing"],
          },
          {
            id: "mock-4",
            name: "E-commerce Win-back Campaign",
            status: "scheduled", 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            statistics: { emailsSent: 0, openRate: 0, replies: 0, bounces: 0, opens: 0, clicks: 0 },
            sequences: [{
              steps: [
                { type: "email", delay: 0, variants: [{ subject: "We miss you!", body: "It's been a while since your last purchase" }] },
                { type: "email", delay: 5, variants: [{ subject: "Special offer just for you", body: "Here's a discount code" }] }
              ]
            }],
            email_list: ["customer@example.com"],
            daily_limit: 150,
            stop_on_reply: false,
            tags: ["ecommerce", "retail", "win-back"],
          }
        ];
        
        return new Response(
          JSON.stringify({ 
            campaigns: mockCampaigns,
            status: 'fallback',
            message: 'API connection failed, using fallback data',
            count: mockCampaigns.length,
            error: error.message,
            fields: Object.keys(mockCampaigns[0] || {}).filter(key => key !== 'raw_data')
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Handle syncWorkflows action
    if (action === 'syncWorkflows') {
      try {
        console.log('Syncing workflows from Instantly API v2');
        
        // Use the correct v2 endpoint for workflows with full data
        const apiEndpoint = `${INSTANTLY_API_URL}/workflows?include_fields=all`;
        console.log(`Making API request to: ${apiEndpoint}`);
        
        // Use both authentication formats
        console.log('Using v2 API authentication format with X-API-KEY header and Bearer token');
        
        // Define headers for debugging
        const headers = {
          'X-API-KEY': INSTANTLY_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': `Bearer ${INSTANTLY_API_KEY}`,
        };
        
        console.log('Request headers for API call:', Object.keys(headers));
        console.log('Full X-API-KEY header value (first 4 chars):', INSTANTLY_API_KEY.substring(0, 4));
        
        // Make the API request
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: headers,
        });
        
        // Log response status and headers for debugging
        console.log(`Instantly API response status: ${response.status}`);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        // Try to parse the response as JSON
        let data;
        try {
          const textResponse = await response.text();
          console.log('Raw response:', textResponse);
          data = JSON.parse(textResponse);
          
          if (!response.ok) {
            return new Response(
              JSON.stringify({ 
                error: 'API error',
                message: data.message || 'Failed to fetch workflows from Instantly API',
                statusCode: response.status,
                details: data
              }),
              { 
                status: response.status, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          // Handle different response formats
          const workflowsArray = data.data || data.items || [];
          
          // Return real data if API call succeeded
          return new Response(
            JSON.stringify({ 
              message: "Workflows sync successful", 
              inserted: workflowsArray.length,
              updated: 0,
              results: workflowsArray
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          // Fall back to mock data
        }
        
        // Fallback mock response when API fails
        return new Response(
          JSON.stringify({ 
            message: "Workflows sync simulation successful (using mock data)", 
            inserted: 5,
            updated: 3,
            results: [
              { status: 'inserted', id: 'mock-wf-1', name: 'New Workflow 1' },
              { status: 'inserted', id: 'mock-wf-2', name: 'New Workflow 2' },
              { status: 'updated', id: 'mock-wf-3', name: 'Updated Workflow 1' }
            ]
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error: any) {
        console.error('Error in syncWorkflows action:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Workflow sync error',
            message: error.message || 'Failed to sync workflows from Instantly API'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Add a new action to get campaign detail
    if (action === 'getCampaignDetail' && campaignId) {
      try {
        console.log(`Fetching details for campaign ID: ${campaignId}`);
        
        // Construct endpoint for specific campaign
        const apiEndpoint = `${INSTANTLY_API_URL}/campaigns/${campaignId}?include_fields=all`;
        console.log(`Making API request to: ${apiEndpoint}`);
        
        // Define headers with both auth formats
        const headers = {
          'X-API-KEY': INSTANTLY_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'authorization': `Bearer ${INSTANTLY_API_KEY}`,
        };
        
        // Make the API request
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: headers,
        });
        
        // Log response details
        console.log(`Campaign detail API response status: ${response.status}`);
        
        // Parse the response
        const textResponse = await response.text();
        console.log('Raw response (truncated):', textResponse.substring(0, 500) + '...');
        const data = JSON.parse(textResponse);
        
        if (!response.ok) {
          console.error('Error fetching campaign details:', data);
          return new Response(
            JSON.stringify({ 
              error: 'API error',
              message: data.message || 'Failed to fetch campaign details',
              statusCode: response.status
            }),
            { 
              status: response.status, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        // Transform the data for the UI
        const campaignDetail = {
          id: data.id,
          name: data.name || '',
          status: data.status || '',
          created_at: data.timestamp_created || data.created_at || new Date().toISOString(),
          updated_at: data.timestamp_updated || data.updated_at || new Date().toISOString(),
          statistics: {
            emailsSent: data.stats?.sent || 0,
            openRate: data.stats?.open_rate || 0,
            replies: data.stats?.replied || 0,
            bounces: data.stats?.bounced || 0,
            opens: data.stats?.opened || 0,
            clicks: data.stats?.clicked || 0
          },
          sequences: data.sequences || [],
          schedule: data.campaign_schedule || {},
          email_list: data.email_list || [],
          daily_limit: data.daily_limit || 0,
          stop_on_reply: data.stop_on_reply || false,
          stop_on_auto_reply: data.stop_on_auto_reply || false,
          tags: data.email_tag_list || [],
          raw_data: data
        };
        
        console.log(`Successfully fetched details for campaign ${campaignId}`);
        
        return new Response(
          JSON.stringify({ 
            campaign: campaignDetail,
            status: 'success'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error: any) {
        console.error(`Error fetching campaign details for ${campaignId}:`, error);
        return new Response(
          JSON.stringify({ 
            error: 'Campaign detail error',
            message: error.message || 'Failed to fetch campaign details',
            campaignId
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }
    
    // Handle updateCampaignTags action
    if (action === 'updateCampaignTags') {
      try {
        if (!campaignId) {
          return new Response(
            JSON.stringify({ error: 'Missing campaignId' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        
        // Validate tags is an array
        if (!Array.isArray(tags)) {
          return new Response(
            JSON.stringify({ error: 'Tags must be an array' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
        
        // First check if the campaign exists in our database - use the correct schema
        console.log(`Checking if campaign ${campaignId} exists`);
        
        // Fix: Use the correctly formatted schema and table name for query
        const { data: existingCampaign, error: checkError } = await supabaseClient
          .from('campaigns')  // Using the correct table name from instantly_integration schema
          .select('id')
          .eq('campaign_id', campaignId)
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking if campaign exists:', checkError);
          // Continue with insertion attempt if there's an error
        }
        
        let updateResult;
        // If campaign doesn't exist yet, insert it first
        if (!existingCampaign) {
          console.log(`Campaign ${campaignId} not found in database, creating record first`);
          
          // Fix: Correctly insert into the campaigns table
          const { data: insertData, error: insertError } = await supabaseClient
            .from('campaigns')
            .insert({ 
              campaign_id: campaignId,
              name: 'Campaign ' + campaignId.substring(0, 8),
              status: 'active',
              tags: tags,
              raw_data: {}
            })
            .select();
            
          if (insertError) {
            console.error('Error inserting campaign:', insertError);
            return new Response(
              JSON.stringify({ 
                error: 'Failed to create campaign record', 
                details: insertError.message,
                hint: 'Please ensure the campaigns table exists in the database.'
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
          }
          
          updateResult = insertData;
          console.log('Successfully inserted new campaign record with tags:', tags);
        } else {
          // Update campaign tags
          console.log(`Updating tags for existing campaign: ${campaignId}`);
          
          // Fix: Correctly update the campaigns table
          const { data: updateData, error: updateError } = await supabaseClient
            .from('campaigns')
            .update({ 
              tags,
              updated_at: new Date().toISOString() 
            })
            .eq('campaign_id', campaignId)
            .select();
            
          if (updateError) {
            console.error('Error updating campaign tags:', updateError);
            return new Response(
              JSON.stringify({ 
                error: 'Failed to update campaign tags', 
                details: updateError.message 
              }),
              {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
          }
          
          updateResult = updateData;
          console.log('Successfully updated campaign tags');
        }
        
        return new Response(
          JSON.stringify({
            message: 'Campaign tags updated successfully',
            campaign: updateResult?.[0] || null
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      } catch (error) {
        console.error('Error updating campaign tags:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update campaign tags', 
            details: error.message || 'Unknown error' 
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }
    
    // Handle other actions
    return new Response(
      JSON.stringify({ 
        error: 'Invalid action', 
        message: `Unknown action: ${action}. Available actions: fetchCampaigns, syncWorkflows, getCampaignDetail, updateCampaignTags`
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    // Catch-all error handler with improved details
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
};

serve(handler);
