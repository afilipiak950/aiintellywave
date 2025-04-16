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

    const effectiveUserId = userId || 'anonymous';
    const effectiveCompanyId = companyId || 'guest-search';
    
    console.log(`Starting job search for user ${effectiveUserId} from company ${effectiveCompanyId}`);
    console.log('Search parameters:', JSON.stringify(searchParams));
    console.log('Force new search:', forceNewSearch);
    console.log('Enhance links:', enhanceLinks);

    if (!searchParams.maxResults || searchParams.maxResults !== 50) {
      searchParams.maxResults = 50;
      console.log('Setting maxResults to 50');
    }

    searchParams.forceNewSearch = true;
    
    searchParams.includeRealLinks = true;

    const supabaseClient = getSupabaseClient();

    let hasAccess = true;
    if (companyId && isValidUUID(companyId)) {
      try {
        hasAccess = await validateCompanyAccess(supabaseClient, companyId);
      } catch (error: any) {
        console.log('Access validation skipped or failed:', error.message);
      }
    } else {
      console.log('Skipping company access validation for guest search or invalid UUID');
    }

    console.log('Access check complete, fetching jobs from Apify...');

    try {
      const sanitizedParams = {
        ...searchParams,
        query: sanitizeSearchTerm(searchParams.query),
        location: searchParams.location ? sanitizeSearchTerm(searchParams.location) : '',
        industry: searchParams.industry ? sanitizeSearchTerm(searchParams.industry) : '',
        forceNewSearch: true,
        includeRealLinks: true
      };
      
      console.log(`Attempting to fetch jobs with sanitized params:`, sanitizedParams);
      
      const startTime = Date.now();
      
      const jobResults = await fetchJobsFromApify(sanitizedParams as SearchParams);
      
      const endTime = Date.now();
      console.log(`Job fetch completed in ${endTime - startTime}ms`);
      
      const isFallback = Array.isArray(jobResults) && 
                          jobResults.length > 0 && 
                          typeof jobResults[0].source === 'string' &&
                          (jobResults[0].source.includes('Fallback') || 
                           jobResults[0].source.includes('Indeed'));
      
      console.log(`Job search complete. Found ${jobResults.length} job listings. Using fallback: ${isFallback}`);
      
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
      
      const enhancedResults = resultsArray.slice(0, 50).map(job => ({
        ...job,
        url: ensureValidJobUrl(job.url || job.directApplyLink || '', job.title, job.company),
        directApplyLink: ensureValidJobUrl(job.directApplyLink || job.url || '', job.title, job.company)
      }));
      
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
      
      const response: JobSearchResponse = {
        success: true,
        data: {
          id: jobOfferRecordId,
          results: enhancedResults,
          total: enhancedResults.length
        },
        fallback: isFallback
      };

      console.log(`Returning response with ${enhancedResults.length} job listings`);
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
      
    } catch (searchError: any) {
      console.error('Error fetching jobs from Apify:', searchError);
      const errorMessage = searchError.message || 'Unbekannter Fehler';
      const errorDetails = searchError.stack || {};
      
      console.error('Detailed error:', errorDetails);
      
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
    
    const errorMessage = error.message || 'Ein unerwarteter Fehler ist aufgetreten';
    const errorDetails = error.details || error.stack || {};
    
    console.error('Error details:', errorDetails);
    
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

function isValidUUID(str: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
}

function sanitizeSearchTerm(term: string): string {
  if (!term) return '';
  
  return term
    .replace(/[\\{}^%`\]<>]/g, '')      
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureValidJobUrl(url: string | undefined, title: string, company: string): string {
  if (!url || url === '#' || url.length < 3) {
    const searchQuery = encodeURIComponent(`${title} ${company} job`);
    return `https://www.google.com/search?q=${searchQuery}`;
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}
