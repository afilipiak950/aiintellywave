
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";

// Use the API key from environment variable
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request information for debugging
    console.log(`Processing request to instantly-ai function`);
    
    // Validate that we have an API key configured
    if (!INSTANTLY_API_KEY) {
      console.error('Instantly API key not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Instantly API key not configured',
          message: 'Please configure the INSTANTLY_API_KEY in Supabase secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body', 
          message: 'Could not parse the request JSON data'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { action, campaignId } = requestData;

    console.log(`Processing ${action} request`);

    // Perform the requested action
    if (action === 'fetchCampaigns') {
      // Fetch all campaigns from Instantly
      const response = await fetch(`${INSTANTLY_API_URL}/campaigns/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Instantly API error:', data);
        return new Response(
          JSON.stringify({ error: data.message || 'Failed to fetch campaigns' }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
          replies: campaign.stats?.replies || 0,
        }
      }));

      return new Response(
        JSON.stringify({ campaigns }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'fetchCampaignDetails') {
      // Validate the campaign ID
      if (!campaignId) {
        return new Response(
          JSON.stringify({ error: 'Campaign ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch campaign details from Instantly
      const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${campaignId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Instantly API error:', data);
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
    }
    else if (action === 'refreshMetrics') {
      // Get all assigned campaigns from the database
      const { supabaseClient } = await import('./supabase.ts');
      const { data: assignments, error: dbError } = await supabaseClient
        .from('instantly_customer_campaigns')
        .select('*');

      if (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ error: dbError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!assignments || assignments.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: 'No campaigns to refresh', updatedCount: 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update metrics for each campaign
      const updatePromises = assignments.map(async (assignment) => {
        try {
          // Fetch updated metrics from Instantly
          const response = await fetch(`${INSTANTLY_API_URL}/campaigns/${assignment.campaign_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error(`Error refreshing metrics for campaign ${assignment.campaign_id}:`, data);
            return { 
              status: 'error', 
              id: assignment.id, 
              error: data.message || 'Failed to fetch updated metrics' 
            };
          }

          // Update the database with new metrics
          const metrics = {
            emailsSent: data.data.stats?.sent || 0,
            openRate: data.data.stats?.open_rate || 0,
            clickRate: data.data.stats?.click_rate || 0,
            conversionRate: data.data.stats?.conversion_rate || 0,
            replies: data.data.stats?.replies || 0,
          };

          const { error: updateError } = await supabaseClient
            .from('instantly_customer_campaigns')
            .update({ 
              metrics, 
              campaign_status: data.data.status,
              updated_at: new Date().toISOString()
            })
            .eq('id', assignment.id);

          if (updateError) {
            console.error(`Error updating database for campaign ${assignment.campaign_id}:`, updateError);
            return { 
              status: 'error', 
              id: assignment.id, 
              error: updateError.message 
            };
          }

          return { status: 'updated', id: assignment.id };
        } catch (error) {
          console.error(`Exception in refreshing campaign ${assignment.campaign_id}:`, error);
          return { 
            status: 'error', 
            id: assignment.id, 
            error: error.message || 'Unknown error' 
          };
        }
      });

      const results = await Promise.all(updatePromises);
      
      // Count the results
      const updatedCount = results.filter(r => r.status === 'updated').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      return new Response(
        JSON.stringify({
          success: true,
          message: `Updated metrics for ${updatedCount} campaigns${errorCount > 0 ? ` with ${errorCount} errors` : ''}`,
          updatedCount,
          errorCount,
          results
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
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
});
