
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { createErrorResponse, getSupabaseClient } from "./utils.ts";
import { handleSyncWorkflows } from "./handlers/syncHandler.ts";
import { handleShareWorkflow } from "./handlers/shareHandler.ts";
import { n8nApiUrl, n8nApiKey } from "./config.ts";

// Main serve function for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!n8nApiUrl || !n8nApiKey) {
      return createErrorResponse("Missing n8n API configuration. Please configure the environment variables.");
    }
    
    // Parse request body
    const requestData = await req.json();
    console.log("[n8n-workflows] Request received:", { action: requestData.action });
    
    // Create Supabase client with auth context
    const supabase = await getSupabaseClient(req);
    
    // Get the action to perform
    const { action } = requestData;

    // Route the request based on action
    switch (action) {
      case 'sync':
        return await handleSyncWorkflows(supabase, n8nApiUrl, n8nApiKey);
      
      case 'share':
        const { workflowId, data } = requestData;
        if (!workflowId) {
          return createErrorResponse("Missing workflowId parameter");
        }
        return await handleShareWorkflow(supabase, workflowId, data);
      
      default:
        return createErrorResponse(`Unknown action: ${action}`);
    }

  } catch (error: any) {
    console.error(`[n8n-workflows] Unhandled error: ${error.message}`);
    return createErrorResponse(`Unhandled error: ${error.message}`, 500);
  }
});
