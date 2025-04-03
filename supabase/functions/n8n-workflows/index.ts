
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
    
    // Enhanced configuration validation
    console.log("[n8n-workflows] Checking n8n API Configuration:");
    console.log(`[n8n-workflows] API URL: ${n8nApiUrl}`);
    console.log(`[n8n-workflows] API Key: ${n8nApiKey ? 'PROVIDED' : 'MISSING'}`);
    
    // Validate configuration at startup with more detailed logging
    if (!validateConfig()) {
      console.error("[n8n-workflows] Configuration validation FAILED");
      return createErrorResponse("Invalid n8n API configuration. Please check N8N_API_URL and N8N_API_KEY environment variables.");
    }

    // Attempt to validate n8n API credentials by making a test request
    try {
      const testResponse = await fetch(`${n8nApiUrl}/workflows`, {
        method: "GET",
        headers: {
          "X-N8N-API-KEY": n8nApiKey,
          "Content-Type": "application/json"
        }
      });

      console.log(`[n8n-workflows] Test API Request Status: ${testResponse.status}`);

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error(`[n8n-workflows] API Test Failed. Response: ${errorText}`);
        return createErrorResponse(`n8n API connection test failed. Status: ${testResponse.status}. Please check your credentials.`);
      }

      console.log("[n8n-workflows] API Credentials Verified Successfully");
    } catch (apiTestError) {
      console.error("[n8n-workflows] API Connection Test Error:", apiTestError);
      return createErrorResponse(`Failed to connect to n8n API: ${apiTestError.message}`);
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
