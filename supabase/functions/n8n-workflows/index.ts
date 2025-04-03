
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from './corsHeaders.ts';
import { handleSync } from './handlers/syncHandler.ts';
import { handleShare } from './handlers/shareHandler.ts';
import { n8nApiUrl, n8nApiKey } from './config.ts';
import { createErrorResponse } from './utils.ts';

console.log("Starting n8n-workflows function...");
console.log(`Environment check - N8N API URL: ${n8nApiUrl ? "Set" : "Not set"}`);
console.log(`Environment check - N8N API Key: ${n8nApiKey ? "Set" : "Not set"}`);

serve(async (req) => {
  // Add more detailed request logging
  console.log(`[n8n-workflows] Received ${req.method} request at ${new Date().toISOString()}`);
  console.log(`[n8n-workflows] Request URL: ${req.url}`);
  
  try {
    // Handle CORS preflight requests with extra debugging
    if (req.method === 'OPTIONS') {
      console.log("[n8n-workflows] Handling CORS preflight request");
      console.log("[n8n-workflows] Origin:", req.headers.get("origin"));
      console.log("[n8n-workflows] Access-Control-Request-Method:", req.headers.get("access-control-request-method"));
      console.log("[n8n-workflows] Access-Control-Request-Headers:", req.headers.get("access-control-request-headers"));
      
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Check authentication
    const authHeader = req.headers.get('Authorization');
    console.log(`[n8n-workflows] Auth header present: ${authHeader ? 'Yes' : 'No'}`);
    
    if (!authHeader) {
      return createErrorResponse('Missing authorization header', 401);
    }
    
    // Log request body content type
    console.log(`[n8n-workflows] Content-Type: ${req.headers.get('Content-Type')}`);

    // Parse request body with better error handling
    let requestData;
    try {
      requestData = await req.json();
      console.log(`[n8n-workflows] Request data: ${JSON.stringify(requestData)}`);
    } catch (error) {
      console.error(`[n8n-workflows] Failed to parse request body: ${error.message}`);
      return createErrorResponse('Invalid JSON request body', 400, error.message);
    }

    // Check environment variables
    if (!n8nApiUrl || !n8nApiKey) {
      console.error(`[n8n-workflows] Missing required environment variables: ${!n8nApiUrl ? 'N8N_API_URL ' : ''}${!n8nApiKey ? 'N8N_API_KEY' : ''}`);
      return createErrorResponse(
        'Server configuration error: Missing required environment variables',
        500,
        `${!n8nApiUrl ? 'N8N_API_URL ' : ''}${!n8nApiKey ? 'N8N_API_KEY' : ''}`
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
    
    return createErrorResponse(`Server error: ${error.message}`, 500, error.stack);
  }
});
