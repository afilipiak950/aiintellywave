
import { SearchParams } from './types.ts';
import { apifyApiKey } from './config.ts';

function generateGoogleJobsUrl(searchParams: SearchParams): string {
  try {
    const { query, location, experience, industry } = searchParams;
    
    // Create the base search term with proper encoding
    let searchTerms = [];
    
    // Add the main query
    if (query && query.trim()) {
      searchTerms.push(query.trim());
    }
    
    // Add location if provided
    if (location && location.trim()) {
      searchTerms.push(location.trim());
    }
    
    // Add experience level if provided and not 'any'
    if (experience && experience !== 'any') {
      const experienceTerms: Record<string, string> = {
        'entry_level': 'junior',
        'mid_level': 'mid-level',
        'senior_level': 'senior'
      };
      if (experienceTerms[experience]) {
        searchTerms.push(experienceTerms[experience]);
      }
    }
    
    // Add industry if provided
    if (industry && industry.trim()) {
      searchTerms.push(industry.trim());
    }
    
    // Ensure 'jobs' or 'job' is included in the search
    if (!searchTerms.some(term => term.toLowerCase().includes('job'))) {
      searchTerms.push('jobs');
    }
    
    // Create properly formatted URL in the exact required format
    const searchQuery = encodeURIComponent(searchTerms.join(' '));
    const safeUrl = `https://www.google.com/search?q=${searchQuery}&jbr=sep:0&udm=8&ved=2ahUKEwiItui7qdiMAxXL9AIHHW7uKIIQ3L8LegQIIBAN`;
    
    console.log(`Generated Google Jobs URL: ${safeUrl}`);
    return safeUrl;
  } catch (error) {
    console.error("Error generating URL:", error);
    // Fallback to a very basic search URL in the required format if there's an error
    return `https://www.google.com/search?q=jobs&jbr=sep:0&udm=8&ved=2ahUKEwiItui7qdiMAxXL9AIHHW7uKIIQ3L8LegQIIBAN`;
  }
}

export async function fetchJobsFromApify(searchParams: SearchParams) {
  try {
    // Generate a Google Jobs search URL based on the search parameters
    const googleJobsUrl = generateGoogleJobsUrl(searchParams);
    console.log(`Using Google Jobs URL: ${googleJobsUrl}`);
    
    // Set the language to German if not specified
    const language = searchParams.language || 'DE';
    
    // Get maximum results (default to 50)
    const maxResults = searchParams.maxResults || 50;
    
    // Create the Apify input payload
    const inputPayload = {
      startUrls: [{ url: googleJobsUrl }],
      maxItems: maxResults,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      endPage: 5,
      includeUnfilteredResults: false,
      countryCode: "de", // Use lowercase "de" for German results
      languageCode: language === 'DE' ? 'de' : 'en'
    };
    
    console.log(`Sending request to Apify with input: ${JSON.stringify(inputPayload)}`);
    
    // Make a direct synchronous request to the Apify API
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
