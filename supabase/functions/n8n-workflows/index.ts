
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './corsHeaders.ts';
import { handleSync } from './handlers/syncHandler.ts';
import { handleShare } from './handlers/shareHandler.ts';
import { createErrorResponse } from './utils.ts';

console.log("Starting n8n-workflows function...");

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
      console.log(`[n8n-workflows] Request data: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.error(`[n8n-workflows] Failed to parse request body: ${error.message}`);
      return createErrorResponse('Invalid JSON request body', 400);
    }

    // Handle different actions
    const { action, workflowId, data } = requestData;
    console.log(`[n8n-workflows] Request action: ${action}`);

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
  } catch (error) {
    console.error(`[n8n-workflows] Unhandled error: ${error.message}`);
    console.error(error.stack);
    
    return createErrorResponse(`Server error: ${error.message}`, 500);
  }
});
