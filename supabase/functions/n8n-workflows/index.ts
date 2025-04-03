
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { handleSync } from "./handlers/syncHandler.ts";
import { handleShare } from "./handlers/shareHandler.ts";

serve(async (req) => {
  console.log(`[n8n-workflows] Received ${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("[n8n-workflows] Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[n8n-workflows] Parsing request body");
    let body;
    try {
      body = await req.json();
      console.log("[n8n-workflows] Request body parsed:", JSON.stringify(body));
    } catch (error) {
      console.error("[n8n-workflows] Failed to parse request body:", error);
      throw new Error("Invalid request body: " + (error as Error).message);
    }
    
    const { action, workflowId, data } = body;
    
    console.log(`[n8n-workflows] Processing action: ${action}`);
    
    if (action === 'sync') {
      console.log("[n8n-workflows] Handling sync action");
      return await handleSync(req);
    } else if (action === 'share' && workflowId && data) {
      console.log("[n8n-workflows] Handling share action");
      return await handleShare(workflowId, data);
    } else {
      console.error("[n8n-workflows] Invalid action or missing parameters");
      throw new Error("Invalid action or missing required parameters");
    }
  } catch (error) {
    console.error("[n8n-workflows] Error in edge function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message || "An unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
