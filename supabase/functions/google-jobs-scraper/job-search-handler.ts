
import { corsHeaders } from './config.ts';
import { fetchJobsFromApify } from './apify-service.ts';
import { getSupabaseClient, saveSearchResults, validateCompanyAccess } from './db-service.ts';
import { JobSearchResponse, SearchParams } from './types.ts';

export async function handleJobSearch(req: Request): Promise<Response> {
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
    const supabaseClient = getSupabaseClient();

    // Validate that the company has Google Jobs feature enabled
    const hasAccess = await validateCompanyAccess(supabaseClient, companyId);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Google Jobs feature is not enabled for this company' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Fetch jobs from Apify
    const formattedResults = await fetchJobsFromApify(searchParams as SearchParams);
    
    // Store the search results in the database
    const jobOfferRecord = await saveSearchResults(
      supabaseClient,
      companyId,
      userId,
      searchParams,
      formattedResults
    );
    
    // Return the formatted results
    const response: JobSearchResponse = {
      success: true,
      data: {
        id: jobOfferRecord.id,
        results: formattedResults,
        total: formattedResults.length
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.details || error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
