
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

    // Make userId and companyId optional by logging but not requiring them
    const effectiveUserId = userId || 'anonymous';
    const effectiveCompanyId = companyId || 'guest-search';
    
    console.log(`Starting job search for user ${effectiveUserId} from company ${effectiveCompanyId}`);
    console.log('Search parameters:', JSON.stringify(searchParams));

    // Initialize Supabase client
    const supabaseClient = getSupabaseClient();

    // Skip access validation if no company ID provided
    let hasAccess = true;
    if (companyId) {
      try {
        hasAccess = await validateCompanyAccess(supabaseClient, companyId);
      } catch (error) {
        console.log('Access validation skipped or failed:', error.message);
        // Continue anyway - we'll allow searches without company association
      }
    }

    console.log('Access check complete, fetching jobs from Apify...');

    try {
      // Fetch jobs from Apify - this will now return up to 50 unique company results
      const formattedResults = await fetchJobsFromApify(searchParams as SearchParams);
      
      console.log(`Job search complete. Found ${formattedResults.length} unique job listings`);
      
      if (formattedResults.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'no-results',
              results: [],
              total: 0
            },
            message: 'Keine Jobangebote für diese Suchkriterien gefunden.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Only store search results in the database if we have valid user and company IDs
      let jobOfferRecordId = 'temporary-search';
      if (userId && companyId && userId !== 'anonymous' && companyId !== 'guest-search') {
        try {
          const jobOfferRecord = await saveSearchResults(
            supabaseClient,
            companyId,
            userId,
            searchParams,
            formattedResults
          );
          jobOfferRecordId = jobOfferRecord.id;
          console.log(`Search results saved with record ID: ${jobOfferRecordId}`);
        } catch (error) {
          console.log('Skipping search result storage due to missing user/company context:', error.message);
        }
      } else {
        console.log('Skipping search result storage due to missing user/company context');
      }
      
      // Return the formatted results
      const response: JobSearchResponse = {
        success: true,
        data: {
          id: jobOfferRecordId,
          results: formattedResults,
          total: formattedResults.length
        }
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (searchError) {
      console.error('Error fetching jobs from Apify:', searchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Fehler beim Abrufen der Jobangebote: ${searchError.message}`,
          details: searchError.stack || {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
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
