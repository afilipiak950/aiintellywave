
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { createErrorResponse, getSupabaseClient } from "./utils.ts";
import { handleSyncWorkflows } from "./handlers/syncHandler.ts";
import { handleShareWorkflow } from "./handlers/shareHandler.ts";
import { n8nApiUrl, n8nApiKey, validateConfig } from "./config.ts";

// Main serve function for the Edge Function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log incoming request for debugging
    const url = new URL(req.url);
    console.log(`[n8n-workflows] Received ${req.method} request to ${url.pathname}`);
    
    // Validate configuration at startup
    if (!validateConfig()) {
      return createErrorResponse("Missing n8n API configuration. Please configure N8N_API_URL and N8N_API_KEY environment variables.");
    }
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("[n8n-workflows] Request payload:", { action: requestData.action });
    } catch (error) {
      console.error("[n8n-workflows] Failed to parse JSON body:", error.message);
      return createErrorResponse("Invalid JSON request body");
    }
    
    // Create Supabase client with auth context
    let supabase;
    try {
      supabase = await getSupabaseClient(req);
    } catch (error: any) {
      console.error("[n8n-workflows] Failed to create Supabase client:", error.message);
      return createErrorResponse(`Authentication error: ${error.message}`, 401);
    }
    
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
