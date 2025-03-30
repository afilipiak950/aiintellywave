
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, openAiApiKey } from "./config.ts";
import { crawlWebsite } from "./crawler.ts";
import { processDocumentContent } from "./documents.ts";
import { generateContentWithOpenAI } from "./openai.ts";
import { createJob, updateJobStatus } from "./jobs.ts";

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
      // Create job entry in the database
      try {
        await createJob(jobId, url);
        
        // Start processing in "background" by not awaiting the promise
        // This isn't true background processing but will allow the function to return
        // while processing continues (until the function timeout)
        processJobInBackground({ jobId, url, maxPages, maxDepth, documents });
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Job started. You will be notified when processing completes.",
            jobId
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        console.error('Failed to create job:', error);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to start background job" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

// Process the job without using waitUntil since it's not available
async function processJobInBackground(params: { 
  jobId: string; 
  url: string;
  maxPages: number;
  maxDepth: number;
  documents: any[];
}) {
  const { jobId, url, maxPages, maxDepth, documents } = params;
  
  try {
    console.log(`Processing job ${jobId} in background`);
    
    // Update job progress
    await updateJobStatus({ 
      jobId, 
      status: 'processing', 
      progress: 5 
    });
    
    // Step 1: Crawl website if URL provided
    let textContent = "";
    let pageCount = 0;
    let domain = "";
    
    if (url) {
      console.log(`Crawling website: ${url}`);
      const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
      
      if (!crawlResult.success) {
        await updateJobStatus({
          jobId,
          status: 'failed',
          error: crawlResult.error || "Failed to crawl website"
        });
        return;
      }
      
      textContent = crawlResult.textContent;
      pageCount = crawlResult.pageCount;
      domain = crawlResult.domain;
      
      await updateJobStatus({
        jobId,
        status: 'processing',
        progress: 40,
        domain,
        pageCount
      });
    }
    
    // Step 2: Process documents
    if (documents && documents.length > 0) {
      console.log(`Processing ${documents.length} uploaded documents`);
      const documentContent = processDocumentContent(documents);
      textContent += documentContent;
      
      await updateJobStatus({
        jobId,
        status: 'processing',
        progress: 60
      });
    }
    
    // No content to analyze
    if (!textContent) {
      await updateJobStatus({
        jobId,
        status: 'failed',
        error: "No content to analyze"
      });
      return;
    }
    
    // Step 3: Generate content with OpenAI
    await updateJobStatus({
      jobId,
      status: 'processing',
      progress: 70,
    });
    
    console.log(`Generating content with OpenAI${domain ? ` for ${domain}` : ''}`);
    
    try {
      const { summary, faqs } = await generateContentWithOpenAI(textContent, domain);
      
      // Update job with results
      await updateJobStatus({
        jobId,
        status: 'completed',
        progress: 100,
        summary,
        faqs,
        pageCount,
        domain
      });
      
      console.log(`Job ${jobId} completed successfully`);
    } catch (error: any) {
      console.error(`OpenAI error: ${error.message}`);
      await updateJobStatus({
        jobId,
        status: 'failed',
        error: `Error generating AI content: ${error.message}`
      });
    }
    
  } catch (error: any) {
    console.error(`Background job error: ${error.message}`);
    try {
      await updateJobStatus({
        jobId,
        status: 'failed',
        error: error.message
      });
    } catch (updateError) {
      console.error('Failed to update job status after error:', updateError);
    }
  }
}
