
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

    // Define Apify API token
    const apifyToken = Deno.env.get('APIFY_API_KEY') || '';
    
    if (!apifyToken) {
      return new Response(
        JSON.stringify({ error: 'Apify API token is not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Prepare the Apify input payload
    const apifyInput = {
      queries: [{
        searchTerm: searchParams.query,
        location: searchParams.location || '',
        language: 'DE', // Default to German
      }],
      maxPagesPerQuery: 2,
      proxyConfiguration: { useApifyProxy: false }
    };
    
    console.log('Sending request to Apify with input:', JSON.stringify(apifyInput));
    
    // Call Apify API with the direct run-sync-get-dataset-items endpoint
    const apifyUrl = `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${apifyToken}`;
    
    // Send the request to Apify
    const apifyResponse = await fetch(apifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyInput),
    });
    
    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', apifyResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Apify API error: ${apifyResponse.status}`, 
          details: errorText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Parse the response from Apify - this directly contains the job items
    const jobItems = await apifyResponse.json();
    console.log(`Retrieved ${jobItems.length} job items from Apify`);
    
    // Format the job results
    const formattedResults = jobItems.map(item => ({
      title: item.title || '',
      company: item.company || '',
      location: item.location || '',
      description: item.description || '',
      url: item.url || '',
      datePosted: item.date || '',
      salary: item.salary || '',
      employmentType: item.employmentType || '',
      source: 'google-jobs'
    })).slice(0, searchParams.maxResults || 100);
    
    // Store the search results in the database
    const { data: jobOfferRecord, error: insertError } = await supabaseClient
      .from('job_search_history')
      .insert({
        company_id: companyId,
        user_id: userId,
        search_query: searchParams.query,
        search_location: searchParams.location,
        search_experience: searchParams.experience,
        search_industry: searchParams.industry,
        search_results: formattedResults,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
