
import { corsHeaders } from './config.ts';
import { fetchJobsFromApify } from './apify-service.ts';
import { getSupabaseClient, saveSearchResults, validateCompanyAccess } from './db-service.ts';
import { JobSearchResponse, SearchParams } from './types.ts';

export async function handleJobSearch(req: Request): Promise<Response> {
  try {
    const { searchParams, userId, companyId } = await req.json();
    
    if (!searchParams || !searchParams.query) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Suchbegriff ist erforderlich' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!userId || !companyId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Benutzer-ID und Firmen-ID sind erforderlich' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting job search for user ${userId} from company ${companyId}`);
    console.log('Search parameters:', JSON.stringify(searchParams));

    // Initialize Supabase client
    const supabaseClient = getSupabaseClient();

    // Validate that the company has Google Jobs feature enabled
    const hasAccess = await validateCompanyAccess(supabaseClient, companyId);

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Die Google Jobs-Funktion ist für diese Firma nicht aktiviert' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log('Access validated, fetching jobs from Apify...');

    // Fetch jobs from Apify - this will now return up to 50 unique company results
    const formattedResults = await fetchJobsFromApify(searchParams as SearchParams);
    
    console.log(`Job search complete. Found ${formattedResults.length} unique job listings`);
    
    // Store the search results in the database
    const jobOfferRecord = await saveSearchResults(
      supabaseClient,
      companyId,
      userId,
      searchParams,
      formattedResults
    );
    
    console.log(`Search results saved with record ID: ${jobOfferRecord.id}`);
    
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
    
    // Get detailed error information
    const errorMessage = error.message || 'Ein unerwarteter Fehler ist aufgetreten';
    const errorDetails = error.details || error.stack || {};
    
    console.error('Error details:', errorDetails);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: errorDetails
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
