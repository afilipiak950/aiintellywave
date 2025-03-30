
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, openAiApiKey } from "./config.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";
import { processJobInBackground } from "./jobs.ts";

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
        JSON.stringify({ success: false, error: "Either URL or documents must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check for OpenAI API key
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (background && jobId) {
      // Process in background mode
      console.log(`Starting background job: ${jobId}`);
      
      // Use EdgeRuntime.waitUntil to process in the background
      // This allows the function to return immediately while processing continues
      (Deno as any).core.opAsync(
        "op_spawn_wait_until", 
        Promise.resolve().then(() => {
          processJobInBackground({ jobId, url, maxPages, maxDepth, documents });
        })
      );
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Job started in the background",
          jobId
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      // Synchronous processing (original behavior)
      // Step 1: Crawl the website if URL is provided
      let textContent = "";
      let pageCount = 0;
      let domain = "";
      
      if (url) {
        console.log(`Crawling website: ${url}`);
        const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
        
        if (!crawlResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: crawlResult.error }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        textContent = crawlResult.textContent;
        pageCount = crawlResult.pageCount;
        domain = crawlResult.domain;
      }
      
      // Step 2: Process any uploaded documents
      if (documents && documents.length > 0) {
        console.log(`Processing ${documents.length} uploaded documents`);
        const documentContent = processDocumentContent(documents);
        textContent += documentContent;
      }
      
      if (!textContent) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "No content to analyze. Please provide a URL or upload documents." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Step 3: Generate summary and FAQs with OpenAI
      console.log(`Generating content with OpenAI${domain ? ` for ${domain}` : ''}`);
      const { summary, faqs } = await generateContentWithOpenAI(
        textContent, 
        domain
      );
      
      // Return successful response
      return new Response(
        JSON.stringify({
          success: true,
          summary,
          faqs,
          pageCount,
          domain
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json"
          } 
        }
      );
    }
  } catch (error: any) {
    console.error(`Error in edge function: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
