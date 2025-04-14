
import { SearchParams } from './types.ts';
import { apifyApiKey } from './config.ts';

function generateGoogleJobsUrl(searchParams: SearchParams): string {
  const { query, location, experience, industry } = searchParams;
  
  // Base search term with proper encoding and Google Jobs specific formatting
  let searchTerm = encodeURIComponent(query.trim() + " jobs");
  
  // Enhance search term with experience level if provided
  if (experience && experience !== 'any') {
    const experienceTerms = {
      'entry_level': 'entry level junior',
      'mid_level': 'mid-level',
      'senior_level': 'senior'
    };
    searchTerm += `%20${encodeURIComponent(experienceTerms[experience] || '')}`;
  }
  
  // Add industry if provided
  if (industry && industry.trim()) {
    searchTerm += `%20${encodeURIComponent(industry.trim())}`;
  }
  
  // Build the location parameter
  const locationParam = location && location.trim() 
    ? `&location=${encodeURIComponent(location.trim())}`
    : '';
  
  // More stable URL format to ensure Google Jobs loads properly
  return `https://www.google.com/search?q=${searchTerm}&ibp=htl;jobs${locationParam}&jbr=sep:0&udm=8`;
}

export async function fetchJobsFromApify(searchParams: SearchParams) {
  try {
    // Generate a Google Jobs search URL based on the search parameters
    const googleJobsUrl = generateGoogleJobsUrl(searchParams);
    console.log(`Generated Google Jobs URL: ${googleJobsUrl}`);
    
    // Set the language to German if not specified
    const language = searchParams.language || 'DE';
    
    // Get maximum results (default to 50)
    const maxResults = searchParams.maxResults || 50;
    
    // Create the Apify input payload with proper format and parameters
    const inputPayload = {
      startUrls: [{ url: googleJobsUrl }],
      maxItems: maxResults,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      endPage: 5,
      includeUnfilteredResults: false,
      countryCode: "us", // Use lowercase "us" as it's widely supported by Google
      languageCode: language === 'DE' ? 'de' : 'en'
    };
    
    console.log(`Sending request to Apify with input: ${JSON.stringify(inputPayload)}`);
    
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout
    
    // Make a direct synchronous request to the Apify API using the recommended endpoint
    const response = await fetch(
      `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputPayload),
        signal: controller.signal
      }
    );
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Apify API error: ${response.status} ${responseText}`);
      throw new Error(`Apify API-Fehler: ${response.status} - ${responseText}`);
    }
    
    // The response directly contains the job data items
    const jobsData = await response.json();
    
    console.log(`Successfully received ${jobsData.length} job listings from Apify`);
    
    // Process and format the job results
    const formattedResults = processJobResults(jobsData, maxResults);
    
    // Add explicit log to see what's being returned
    console.log(`Returning ${formattedResults.length} formatted job results`);
    
    return formattedResults;
  } catch (error) {
    // Special handling for timeout errors
    if (error.name === 'AbortError') {
      console.error("Request timed out after 60 seconds");
      throw new Error("Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es später erneut.");
    }
    
    console.error("Error during Apify request:", error);
    throw error;
  }
}

// Process and format job results
function processJobResults(jobsData: any[], maxResults = 50) {
  // Ensure jobsData is an array
  if (!Array.isArray(jobsData)) {
    console.error('processJobResults received non-array data:', jobsData);
    return [];
  }
  
  // Group jobs by company to get a more diverse result set
  const jobsByCompany: Record<string, any[]> = {};
  
  // Process and deduplicate job listings
  for (const job of jobsData) {
    // Skip invalid job entries
    if (!job || typeof job !== 'object') continue;
    
    const company = job.company?.trim().toLowerCase() || 'unknown';
    
    if (!jobsByCompany[company]) {
      jobsByCompany[company] = [];
    }
    
    // Only keep up to 3 jobs per company for diversity
    if (jobsByCompany[company].length < 3) {
      jobsByCompany[company].push({
        title: job.title || 'Unbekannter Jobtitel',
        company: job.company || 'Unbekanntes Unternehmen',
        location: job.location || 'Remote/Flexibel',
        description: job.description || 'Keine Beschreibung verfügbar.',
        url: job.url || '#',
        datePosted: job.datePosted || null,
        salary: job.salary || null,
        employmentType: job.employmentType || null,
        source: 'Google Jobs'
      });
    }
  }
  
  // Flatten the grouped jobs back into an array
  let formattedResults: any[] = [];
  for (const company in jobsByCompany) {
    formattedResults = formattedResults.concat(jobsByCompany[company]);
  }
  
  // Limit to maxResults
  return formattedResults.slice(0, maxResults);
}
