
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams, userId, companyId } = await req.json();
    
    if (!searchParams || !searchParams.query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!userId || !companyId) {
      return new Response(
        JSON.stringify({ error: 'User ID and Company ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Validate that the company has Google Jobs feature enabled
    const { data: companyFeature, error: featureError } = await supabaseClient
      .from('company_features')
      .select('google_jobs_enabled')
      .eq('company_id', companyId)
      .single();

    if (featureError) {
      console.error('Error fetching company features:', featureError);
      // Check if the error is because the feature doesn't exist yet
      if (featureError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Google Jobs feature is not enabled for this company' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
      
      throw featureError;
    }

    if (!companyFeature?.google_jobs_enabled) {
      return new Response(
        JSON.stringify({ error: 'Google Jobs feature is not enabled for this company' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Call Apify API to scrape Google Jobs
    const apifyUrl = 'https://api.apify.com/v2/acts/nopnOEWIYjLQfBqEO/runs?token=' + Deno.env.get('APIFY_API_KEY');
    
    // Prepare the request body for Apify
    const apifyInput = {
      queries: [{
        query: searchParams.query,
        location: searchParams.location,
        countryCode: 'DE', // Default to Germany
        languageCode: 'de', // Default to German
      }],
      maxPagesPerQuery: 2,
      saveHtml: false,
      saveHtmlToKeyValueStore: false,
      includeUnfilteredResults: false,
    };

    // Start the Apify actor run
    const apifyResponse = await fetch(apifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        runInput: apifyInput 
      }),
    });

    if (!apifyResponse.ok) {
      const errorData = await apifyResponse.text();
      console.error('Apify API error:', errorData);
      throw new Error(`Apify API error: ${apifyResponse.status} ${apifyResponse.statusText}`);
    }

    const apifyRunResult = await apifyResponse.json();
    const runId = apifyRunResult.data.id;
    
    console.log(`Apify job started with run ID: ${runId}`);
    
    // Wait for run to complete (with timeout)
    let jobComplete = false;
    let attempts = 0;
    let jobResults;
    
    while (!jobComplete && attempts < 10) {
      // Wait a bit between checks
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check run status
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${Deno.env.get('APIFY_API_KEY')}`
      );
      
      if (!statusResponse.ok) {
        console.error(`Error checking job status: ${statusResponse.status} ${statusResponse.statusText}`);
        attempts++;
        continue;
      }
      
      const statusData = await statusResponse.json();
      console.log(`Run status: ${statusData.data.status}`);
      
      if (['SUCCEEDED', 'FINISHED'].includes(statusData.data.status)) {
        jobComplete = true;
        
        // Get dataset items
        const datasetId = statusData.data.defaultDatasetId;
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?token=${Deno.env.get('APIFY_API_KEY')}`
        );
        
        if (!datasetResponse.ok) {
          throw new Error(`Error fetching dataset: ${datasetResponse.status} ${datasetResponse.statusText}`);
        }
        
        jobResults = await datasetResponse.json();
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.data.status)) {
        throw new Error(`Apify job failed with status: ${statusData.data.status}`);
      }
      
      attempts++;
    }
    
    if (!jobComplete) {
      throw new Error('Job timed out waiting for results');
    }
    
    // Process and format the results
    let formattedResults = [];
    
    if (jobResults && jobResults.length > 0) {
      // Flatten the job listings from all queries
      const allJobListings = jobResults.flatMap(result => 
        result.jobItems || []
      );
      
      formattedResults = allJobListings.map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        url: job.url,
        datePosted: job.datePosted,
        // Add other fields as needed
      })).slice(0, searchParams.maxResults || 100);
    }
    
    // Store the search results in the database
    const { data: jobOfferRecord, error: insertError } = await supabaseClient
      .from('customer_job_offers')
      .insert({
        company_id: companyId,
        user_id: userId,
        search_query: searchParams.query,
        search_location: searchParams.location,
        search_experience: searchParams.experience,
        search_industry: searchParams.industry,
        search_results: formattedResults
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error saving search results:', insertError);
      throw insertError;
    }
    
    // Return the formatted results
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          id: jobOfferRecord.id,
          results: formattedResults,
          total: formattedResults.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
