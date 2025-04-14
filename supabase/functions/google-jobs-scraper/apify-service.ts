
import { SearchParams } from './types.ts';
import { apifyApiKey } from './config.ts';

// Generate a properly encoded Google Jobs search URL
function generateGoogleJobsUrl(searchParams: SearchParams): string {
  const { query, location, experience, industry } = searchParams;
  
  // Build base search term
  let searchTerm = query.trim();
  
  // Add experience level if provided
  if (experience && experience !== 'any') {
    switch(experience) {
      case 'entry_level':
        searchTerm += ' entry level junior';
        break;
      case 'mid_level':
        searchTerm += ' mid-level';
        break;
      case 'senior_level':
        searchTerm += ' senior';
        break;
    }
  }
  
  // Add industry if provided
  if (industry && industry.trim()) {
    searchTerm += ` ${industry.trim()}`;
  }
  
  // Build the location part if provided
  const locationPart = location && location.trim() ? `&location=${encodeURIComponent(location.trim())}` : '';
  
  // Construct the Google Jobs URL - use the jobs tab specifically
  const baseUrl = "https://www.google.com/search?q=";
  const jobsParams = "&ibp=htl;jobs";
  
  // Complete Google Jobs URL with encoded search term and location
  return `${baseUrl}${encodeURIComponent(searchTerm)}+jobs${locationPart}${jobsParams}`;
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
    
    // Create the Apify input payload with direct URL instead of query parameters
    const inputPayload = {
      startUrls: [{ url: googleJobsUrl }],
      maxItems: maxResults,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      endPage: 5,
      includeUnfilteredResults: false,
      // Fix: Convert country code to lowercase - Apify expects ISO country codes in lowercase
      countryCode: "us", // Use "us" as default since it's widely supported
      languageCode: language === 'DE' ? 'de' : 'en'
    };
    
    console.log(`Sending request to Apify with input: ${JSON.stringify(inputPayload)}`);
    
    // Make a direct synchronous request to the Apify API using the recommended endpoint
    const response = await fetch(
      `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputPayload),
      }
    );
    
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
