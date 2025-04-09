
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { supabaseClient } from "./supabase.ts";
import { handleFetchCampaigns } from "./handlers/fetchCampaigns.ts";
import { handleFetchCampaignDetails } from "./handlers/fetchCampaignDetails.ts";
import { handleRefreshMetrics } from "./handlers/refreshMetrics.ts";
import { 
  handleApiKeyError, 
  handleParseError, 
  handleUnknownAction, 
  handleServerError 
} from "./utils/errorHandlers.ts";

// Use the API key from environment variable
const INSTANTLY_API_KEY = Deno.env.get('INSTANTLY_API_KEY') || '';
const INSTANTLY_API_URL = "https://api.instantly.ai/api/v1";

console.info('Instantly AI edge function started');

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
      return handleApiKeyError();
    }

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      return handleParseError(error);
    }
    
    const { action, campaignId } = requestData;

    console.log(`Processing ${action} request`);

    // Perform the requested action
    if (action === 'fetchCampaigns') {
      return await handleFetchCampaigns(INSTANTLY_API_KEY, INSTANTLY_API_URL);
    } 
    else if (action === 'fetchCampaignDetails') {
      return await handleFetchCampaignDetails(INSTANTLY_API_KEY, INSTANTLY_API_URL, campaignId);
    }
    else if (action === 'refreshMetrics') {
      return await handleRefreshMetrics(INSTANTLY_API_KEY, INSTANTLY_API_URL, supabaseClient);
    }
    else {
      return handleUnknownAction(action);
    }
  } catch (error) {
    return handleServerError(error);
  }
});
