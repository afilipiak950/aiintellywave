
import { corsHeaders } from './config.ts';
import { fetchJobsFromApify } from './apify-service.ts';
import { getSupabaseClient, saveSearchResults, validateCompanyAccess } from './db-service.ts';
import { JobSearchResponse, SearchParams } from './types.ts';

export async function handleJobSearch(req: Request): Promise<Response> {
  try {
    const { searchParams, userId, companyId, forceNewSearch, enhanceLinks } = await req.json();
    
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
    console.log('Force new search:', forceNewSearch);
    console.log('Enhance links:', enhanceLinks);

    // Force maxResults to 100 if not specified or less than 100
    if (!searchParams.maxResults || searchParams.maxResults < 100) {
      searchParams.maxResults = 100;
      console.log('Setting maxResults to 100');
    }

    // Add forceNewSearch flag to ensure we get fresh results
    searchParams.forceNewSearch = true;
    
    // Add flag to ensure real links are prioritized
    searchParams.includeRealLinks = true;

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
      console.log('Skipping company access validation for guest search or invalid UUID');
    }

    console.log('Access check complete, fetching jobs from Apify...');

    try {
      // Sanitize search parameters to prevent URL generation issues
      const sanitizedParams = {
        ...searchParams,
        query: sanitizeSearchTerm(searchParams.query),
        location: searchParams.location ? sanitizeSearchTerm(searchParams.location) : '',
        industry: searchParams.industry ? sanitizeSearchTerm(searchParams.industry) : '',
        forceNewSearch: true,
        includeRealLinks: true
      };
      
      console.log(`Attempting to fetch jobs with sanitized params:`, sanitizedParams);
      
      // Track detailed timing for performance analysis
      const startTime = Date.now();
      
      // Try to fetch jobs - our updated apify-service will handle fallbacks internally
      const jobResults = await fetchJobsFromApify(sanitizedParams as SearchParams);
      
      const endTime = Date.now();
      console.log(`Job fetch completed in ${endTime - startTime}ms`);
      
      // Determine if we're using fallback results
      const isFallback = Array.isArray(jobResults) && 
                          jobResults.length > 0 && 
                          typeof jobResults[0].source === 'string' &&
                          (jobResults[0].source.includes('Fallback') || 
                           jobResults[0].source.includes('Indeed'));
      
      console.log(`Job search complete. Found ${jobResults.length} job listings. Using fallback: ${isFallback}`);
      
      // Ensure we're returning a valid array, even when empty
      const resultsArray = Array.isArray(jobResults) ? jobResults : [];
      
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
      
      // Ensure all job listings have valid URLs
      const enhancedResults = resultsArray.map(job => ({
        ...job,
        url: ensureValidJobUrl(job.url || job.directApplyLink || '', job.title, job.company),
        directApplyLink: ensureValidJobUrl(job.directApplyLink || job.url || '', job.title, job.company)
      }));
      
      // Only store search results in the database if we have valid user and company IDs
      let jobOfferRecordId = 'temporary-search';
      if (userId && companyId && userId !== 'anonymous' && companyId !== 'guest-search' && isValidUUID(companyId)) {
        try {
          const jobOfferRecord = await saveSearchResults(
            supabaseClient,
            companyId,
            userId,
            searchParams,
            enhancedResults
          );
          jobOfferRecordId = jobOfferRecord.id;
          console.log(`Search results saved with record ID: ${jobOfferRecordId}`);
        } catch (error: any) {
          console.log('Skipping search result storage due to error:', error.message);
        }
      } else {
        console.log(`Skipping search result storage: fallback=${isFallback}, user=${userId}, company=${companyId}`);
      }
      
      // Return the formatted results
      const response: JobSearchResponse = {
        success: true,
        data: {
          id: jobOfferRecordId,
          results: enhancedResults,
          total: enhancedResults.length
        },
        fallback: isFallback
      };

      // Log the response structure before sending
      console.log(`Returning response with ${enhancedResults.length} job listings`);
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      
    } catch (searchError: any) {
      console.error('Error fetching jobs from Apify:', searchError);
      // Provide more detailed error information for debugging
      const errorMessage = searchError.message || 'Unbekannter Fehler';
      const errorDetails = searchError.stack || {};
      
      // Log the detailed error for server-side debugging
      console.error('Detailed error:', errorDetails);
      
      // Important: Return a 200 status with error information to prevent edge function error
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Fehler beim Abrufen der Jobangebote: ${errorMessage}`,
          details: errorDetails,
          message: 'Es ist ein Fehler bei der Suche aufgetreten. Bitte versuchen Sie es später erneut oder mit anderen Suchbegriffen.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
  } catch (error: any) {
    console.error('Error processing request:', error);
    
    // Get detailed error information
    const errorMessage = error.message || 'Ein unerwarteter Fehler ist aufgetreten';
    const errorDetails = error.details || error.stack || {};
    
    console.error('Error details:', errorDetails);
    
    // Return 200 status code with error information to prevent non-2xx error
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: errorDetails,
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

// Helper function to sanitize search terms to prevent URL generation issues
function sanitizeSearchTerm(term: string): string {
  if (!term) return '';
  
  // Remove special characters that might cause URL issues
  return term
    .replace(/[\\{}^%`\]<>]/g, '')      // Remove problematic URL characters
    .replace(/\s+/g, ' ')               // Replace multiple spaces with a single space
    .trim();                            // Trim leading/trailing spaces
}

// Helper function to ensure valid job URLs
function ensureValidJobUrl(url: string | undefined, title: string, company: string): string {
  if (!url || url === '#' || url.length < 3) {
    // Create a fallback URL using Google search
    const searchQuery = encodeURIComponent(`${title} ${company} job`);
    return `https://www.google.com/search?q=${searchQuery}`;
  }
  
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}
