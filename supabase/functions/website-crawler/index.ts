
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, openAiApiKey } from "./config.ts";
import { processRequestSync, handleBackgroundJob } from "./handlers.ts";

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const {
      jobId,
      url,
      maxPages = 20,
      maxDepth = 2,
      documents = [],
      background = false
    } = await req.json();
    
    // Validate input - either URL or documents should be provided
    if (!url && (!documents || documents.length === 0)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Either URL or documents must be provided" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Check for OpenAI API key
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "OpenAI API key is not configured" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    let result;
    
    if (background && jobId) {
      // Process in background
      result = await handleBackgroundJob({ jobId, url, maxPages, maxDepth, documents });
    } else {
      // Process synchronously (original behavior)
      result = await processRequestSync({ url, maxPages, maxDepth, documents });
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error(`Error in edge function: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
