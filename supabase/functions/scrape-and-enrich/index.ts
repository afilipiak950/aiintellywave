
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./config.ts";
import { createContactEnrichmentService } from "./contact-enrichment-service.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log('Request received:', requestData);

    const enrichmentService = createContactEnrichmentService();
    
    if (requestData.jobs && Array.isArray(requestData.jobs)) {
      // Batch Enrichment für mehrere Jobs
      console.log(`Starting batch enrichment for ${requestData.jobs.length} jobs`);
      const enrichedJobs = await enrichmentService.enrichJobsWithContacts(requestData.jobs);
      return new Response(JSON.stringify({ 
        success: true, 
        data: enrichedJobs 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else if (requestData.url) {
      // Einzelner Job oder URL-basierte Anfrage
      console.log(`Processing single job or URL request: ${requestData.url}`);
      const mockJob = {
        title: "Job Title",
        company: requestData.company || "Unknown Company",
        url: requestData.url
      };
      const enrichedJob = await enrichmentService.enrichJobWithContacts(mockJob);
      return new Response(JSON.stringify({ 
        success: true, 
        data: enrichedJob 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: "Invalid request format" 
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error(`Error in edge function: ${error.message}`, {
      stack: error.stack,
      details: error.details || null
    });
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unexpected error: ${error.message}`,
      details: error.details || null,
      stack: error.stack || null
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
