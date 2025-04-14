
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
          error: 'Suchbegriff ist erforderlich',
          message: 'Bitte geben Sie einen Suchbegriff ein.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Make userId and companyId optional by logging but not requiring them
    const effectiveUserId = userId || 'anonymous';
    const effectiveCompanyId = companyId || 'guest-search';
    
    console.log(`Starting job search for user ${effectiveUserId} from company ${effectiveCompanyId}`);
    console.log('Search parameters:', JSON.stringify(searchParams));

    // Initialize Supabase client
    const supabaseClient = getSupabaseClient();

    // Skip access validation if no company ID provided or if it's not a valid UUID
    let hasAccess = true;
    if (companyId && isValidUUID(companyId)) {
      try {
        hasAccess = await validateCompanyAccess(supabaseClient, companyId);
      } catch (error: any) {
        console.log('Access validation skipped or failed:', error.message);
        // Continue anyway - we'll allow searches without company association
      }
    } else {
      console.log('Skipping company access validation for guest search or invalid UUID format');
    }

    console.log('Access check complete, fetching jobs from Apify...');

    try {
      // Fetch jobs from Apify using URL-based approach
      const formattedResults = await fetchJobsFromApify(searchParams as SearchParams);
      
      console.log(`Job search complete. Found ${formattedResults.length} job listings`);
      
      // Ensure we're returning a valid array, even when empty
      const resultsArray = Array.isArray(formattedResults) ? formattedResults : [];
      
      if (resultsArray.length === 0) {
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
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Only store search results in the database if we have valid user and company IDs
      let jobOfferRecordId = 'temporary-search';
      if (userId && companyId && userId !== 'anonymous' && companyId !== 'guest-search' && isValidUUID(companyId)) {
        try {
          const jobOfferRecord = await saveSearchResults(
            supabaseClient,
            companyId,
            userId,
            searchParams,
            resultsArray
          );
          jobOfferRecordId = jobOfferRecord.id;
          console.log(`Search results saved with record ID: ${jobOfferRecordId}`);
        } catch (error: any) {
          console.log('Skipping search result storage due to database error:', error.message);
        }
      } else {
        console.log('Skipping search result storage due to missing user/company context or invalid UUID');
      }
      
      // Return the formatted results
      const response: JobSearchResponse = {
        success: true,
        data: {
          id: jobOfferRecordId,
          results: resultsArray,
          total: resultsArray.length
        }
      };

      // Log the response structure before sending
      console.log(`Returning response with ${resultsArray.length} job listings`);
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } catch (searchError: any) {
      console.error('Error fetching jobs from Apify:', searchError);
      const errorMessage = searchError.message || 'Unbekannter Fehler';
      
      // Important: Return a 200 status with error information
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Fehler beim Abrufen der Jobangebote: ${errorMessage}`,
          message: 'Es ist ein Fehler bei der Suche aufgetreten. Bitte versuchen Sie es mit anderen Suchbegriffen oder kontaktieren Sie den Support.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    
    // Return 200 status code with error information
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
}

// Helper function to check if a string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}
