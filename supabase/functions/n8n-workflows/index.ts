
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './corsHeaders.ts';
import { handleSync } from './handlers/syncHandler.ts';
import { handleShare } from './handlers/shareHandler.ts';
import { createErrorResponse } from './utils.ts';

console.log("[n8n-workflows] Starting n8n-workflows function...");
console.log(`[n8n-workflows] Environment check - N8N API URL: ${Deno.env.get("N8N_API_URL") ? "Set" : "Not set"}`);
console.log(`[n8n-workflows] Environment check - N8N API Key: ${Deno.env.get("N8N_API_KEY") ? "Set" : "Not set"}`);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("[n8n-workflows] Handling CORS preflight request");
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse request body with better error handling
    let requestData;
    try {
      requestData = await req.json();
      console.log(`[n8n-workflows] Request received:`, {
        action: requestData.action,
        workflowId: requestData.workflowId || 'not provided'
      });
    } catch (error) {
      console.error(`[n8n-workflows] Failed to parse request body: ${error.message}`);
      return createErrorResponse('Invalid JSON request body', 400);
    }

    // Handle different actions
    const { action, workflowId, data } = requestData;
    console.log(`[n8n-workflows] Processing action: ${action}`);

    switch (action) {
      case 'sync':
        return await handleSync(req);
        
      case 'share':
        if (!workflowId) {
          return createErrorResponse('workflowId is required for share action', 400);
        }
        return await handleShare(workflowId, data);
        
      default:
        console.error(`[n8n-workflows] Unknown action: ${action}`);
        return createErrorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error: any) {
    console.error(`[n8n-workflows] Unhandled error: ${error.message}`);
    console.error(error.stack);
    
    return createErrorResponse(`Server error: ${error.message}`, 500);
  }
});

