
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './corsHeaders.ts';
import { handleSync } from './handlers/syncHandler.ts';
import { handleShare } from './handlers/shareHandler.ts';
import { n8nApiUrl, n8nApiKey } from './config.ts';

console.log("Starting n8n-workflows function...");
console.log(`Environment check - N8N API URL: ${n8nApiUrl ? "Set" : "Not set"}`);
console.log(`Environment check - N8N API Key: ${n8nApiKey ? "Set" : "Not set"}`);

serve(async (req) => {
  // Add more detailed request logging
  console.log(`[n8n-workflows] Received ${req.method} request at ${new Date().toISOString()}`);
  console.log(`[n8n-workflows] Request URL: ${req.url}`);
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log("[n8n-workflows] Handling CORS preflight request");
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log(`[n8n-workflows] Request data: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.error(`[n8n-workflows] Failed to parse request body: ${error.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid JSON request body',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle different actions
    const { action, workflowId, data } = requestData;
    console.log(`[n8n-workflows] Request action: ${action}`);

    switch (action) {
      case 'sync':
        return await handleSync(req);
      case 'share':
        if (!workflowId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'workflowId is required for share action',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        return await handleShare(workflowId, data);
      default:
        console.error(`[n8n-workflows] Unknown action: ${action}`);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Unknown action: ${action}`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error(`[n8n-workflows] Unhandled error: ${error.message}`);
    console.error(error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${error.message}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
