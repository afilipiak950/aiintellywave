
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APIFY_API_TOKEN = Deno.env.get('APIFY_API_KEY') || "";
const GOOGLE_JOBS_ACTOR_ID = "nopnOEWIYjLQfBqEO";

interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
}

interface JobRequest {
  searchParams: SearchParams;
  companyId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const body: JobRequest = await req.json();
    const { searchParams, companyId, userId } = body;

    if (!searchParams || !searchParams.query) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Searching Google Jobs with params:", JSON.stringify(searchParams));

    // Prepare Apify actor input
    const actorInput = {
      queries: [searchParams.query],
      maxPagesPerQuery: 2,
      locationOrDistance: searchParams.location || "",
      maxItems: searchParams.maxResults || 100,
      extendOutputFunction: "",
      csvFriendlyOutput: false,
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
      includeUnfilteredResults: false,
    };

    // Call Apify API to start the actor run
    const startResponse = await fetch(
      `https://api.apify.com/v2/acts/${GOOGLE_JOBS_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          "startUrls": [],
          ...actorInput 
        }),
      }
    );

    if (!startResponse.ok) {
      const errorData = await startResponse.text();
      console.error("Apify actor start failed:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to start job search", details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const startData = await startResponse.json();
    const runId = startData.data.id;
    console.log(`Apify actor run started with ID: ${runId}`);

    // Wait for the run to finish (with timeout)
    let isFinished = false;
    let attempts = 0;
    const maxAttempts = 15; // Maximum of ~5 minutes total wait time

    while (!isFinished && attempts < maxAttempts) {
      attempts++;
      
      // Wait for 20 seconds between status checks
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Check run status
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_API_TOKEN}`,
        { method: 'GET' }
      );

      if (!statusResponse.ok) {
        console.error(`Failed to check run status, attempt ${attempts}`);
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`Run status (attempt ${attempts}): ${statusData.data.status}`);
      
      if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.data.status)) {
        isFinished = true;

        if (statusData.data.status !== 'SUCCEEDED') {
          return new Response(
            JSON.stringify({ error: `Job search ${statusData.data.status.toLowerCase()}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    if (!isFinished) {
      return new Response(
        JSON.stringify({ error: "Job search timed out" }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the dataset items
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_API_TOKEN}`,
      { method: 'GET' }
    );

    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text();
      console.error("Failed to get dataset items:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve job results" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jobResults = await datasetResponse.json();
    console.log(`Retrieved ${jobResults.length} job results`);

    // Store the results in the database
    const { supabaseClient } = await import('./supabaseClient.ts');
    
    const { data, error } = await supabaseClient
      .from('customer_job_offers')
      .insert({
        company_id: companyId,
        user_id: userId,
        search_query: searchParams.query,
        search_location: searchParams.location,
        search_experience: searchParams.experience,
        search_industry: searchParams.industry,
        search_results: jobResults
      })
      .select('id')
      .single();

    if (error) {
      console.error("Error storing job results:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to store job search results",
          jobs: jobResults  // Still return the jobs even if saving failed
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        data: { 
          id: data.id,
          results: jobResults 
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in google-jobs-scraper function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
