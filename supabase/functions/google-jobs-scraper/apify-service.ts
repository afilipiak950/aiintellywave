import { SearchParams } from './types.ts';
import { apifyApiKey } from './config.ts';

export async function fetchJobsFromApify(searchParams: SearchParams) {
  try {
    // Format the search parameters for Apify
    const { query, location, experience, industry, maxResults = 50 } = searchParams;
    
    // Set the language to German if not specified
    const language = searchParams.language || 'DE';
    
    // Use experience to determine job level query parameters
    let experienceFilter = '';
    if (experience) {
      switch(experience) {
        case 'entry_level':
          experienceFilter = ' entry level junior';
          break;
        case 'mid_level':
          experienceFilter = ' mid-level';
          break;
        case 'senior':
          experienceFilter = ' senior expert';
          break;
        // Default: no experience filter
      }
    }
    
    // Add industry filter if specified
    const industryFilter = industry ? ` ${industry}` : '';
    
    // Construct the final search term
    const searchTerm = `${query}${experienceFilter}${industryFilter}`;
    
    // Create the input payload
    const inputPayload = {
      queries: [{
        searchTerm,
        location: location || '',
        language
      }],
      maxPagesPerQuery: 10,
      proxyConfiguration: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      }
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
    
    return formattedResults;
  } catch (error) {
    console.error("Error during Apify request:", error);
    throw error;
  }
}

// Process and format job results
function processJobResults(jobsData: any[], maxResults = 50) {
  // Group jobs by company to get a more diverse result set
  const jobsByCompany: Record<string, any[]> = {};
  
  // Process and deduplicate job listings
  for (const job of jobsData) {
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
