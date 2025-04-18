
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
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Ungültiges JSON-Format in der Anfrage",
          details: parseError.message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log('Request received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      requestData: JSON.stringify(requestData)
    });
    
    const {
      jobId,
      url,
      maxPages = 20,
      maxDepth = 2,
      documents = [],
      background = false
    } = requestData;
    
    // Validate input - either URL or documents should be provided
    if (!url && (!documents || documents.length === 0)) {
      console.error("Missing required parameters: need URL or documents");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Either URL or documents must be provided",
          debug: {
            requestData: JSON.stringify(requestData)
          } 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Für Background-Jobs ist eine JobId erforderlich
    if (background && !jobId) {
      console.error("Missing required parameter for background job: jobId");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "jobId is required for background processing" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // In unserem vereinfachten Fall benötigen wir nicht unbedingt einen OpenAI API Key
    /*
    if (!openAiApiKey) {
      console.error("OpenAI API key is not configured");
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
    */
    
    let result;
    
    if (background && jobId) {
      // Process in background
      console.log(`Starting background job processing with jobId: ${jobId}`);
      try {
        result = await handleBackgroundJob({ 
          jobId, 
          url, 
          userId: requestData.userId, 
          maxPages, 
          maxDepth, 
          documents 
        });
      } catch (bgError) {
        console.error(`Background job error: ${bgError.message}`, {
          stack: bgError.stack,
          jobId,
          url
        });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Background job error: ${bgError.message}`,
            details: bgError.details || null,
            stack: bgError.stack || null,
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    } else {
      // Process synchronously (original behavior)
      result = await processRequestSync({ url, maxPages, maxDepth, documents });
    }
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error) {
    console.error(`Error in edge function: ${error.message}`, {
      stack: error.stack,
      details: error.details || null
    });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error.message}`,
        details: error.details || null,
        stack: error.stack || null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
