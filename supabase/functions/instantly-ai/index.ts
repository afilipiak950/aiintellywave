
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { handleFetchCampaigns } from "./handlers/fetchCampaigns.ts";
import { handleFetchCampaignDetails } from "./handlers/fetchCampaignDetails.ts";
import { handleAssignCampaign } from "./handlers/assignCampaign.ts";
import { handleRefreshMetrics } from "./handlers/refreshMetrics.ts";
import { handleApiKeyError, handleParseError, handleUnknownAction, handleServerError } from "./utils/errorHandlers.ts";

// Constants for Instantly API
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

// CORS headers for handling preflight and response headers
const standardHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json'
};

console.log("Edge function loaded: instantly-ai");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log to help with debugging
    console.log(`Processing request to instantly-ai function, API key configured: ${INSTANTLY_API_KEY ? 'Yes' : 'No'}`);
    
    // Validate API key
    if (!INSTANTLY_API_KEY) {
      console.error('Instantly API key not configured');
      return handleApiKeyError();
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return handleParseError(error);
    }
    
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
        return handleUnknownAction(action);
    }
  } catch (error) {
    return handleServerError(error);
  }
});
