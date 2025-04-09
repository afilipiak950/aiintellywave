
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { handleFetchCampaigns } from "./handlers/fetchCampaigns.ts";
import { handleFetchCampaignDetails } from "./handlers/fetchCampaignDetails.ts";
import { handleAssignCampaign } from "./handlers/assignCampaign.ts";
import { handleRefreshMetrics } from "./handlers/refreshMetrics.ts";

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
        return await handleFetchCampaigns(INSTANTLY_API_KEY, INSTANTLY_API_URL);
      
      case 'fetchCampaignDetails':
        return await handleFetchCampaignDetails(INSTANTLY_API_KEY, INSTANTLY_API_URL, campaignId);
      
      case 'assignCampaign':
        return await handleAssignCampaign(INSTANTLY_API_KEY, INSTANTLY_API_URL, campaignId, customerId);
      
      case 'refreshMetrics':
        return await handleRefreshMetrics(INSTANTLY_API_KEY, INSTANTLY_API_URL);
      
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
