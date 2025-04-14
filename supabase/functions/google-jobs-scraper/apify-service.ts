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
    
    console.log(`Sending request to Apify with input: ${JSON.stringify({
      queries: [{
        searchTerm,
        location: location || '',
        language
      }],
      maxPagesPerQuery: 10,
      proxyConfiguration: {
        useApifyProxy: true, // Changed to true to solve the proxy requirement
        apifyProxyGroups: ["RESIDENTIAL"]
      }
    })}`);
    
    // Make the API request to Apify
    const response = await fetch(
      `https://api.apify.com/v2/acts/bernardo~google-jobs-scraper/runs?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queries: [{
            searchTerm,
            location: location || '',
            language
          }],
          maxPagesPerQuery: 10,
          proxyConfiguration: {
            useApifyProxy: true, // Changed to true to solve the proxy requirement
            apifyProxyGroups: ["RESIDENTIAL"]
          }
        }),
      }
    );
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Apify API error: ${response.status} ${responseText}`);
      throw new Error(`Apify API-Fehler: ${response.status} - ${responseText}`);
    }
    
    const result = await response.json();
    
    // Wait for the task to complete and get the dataset ID
    const { defaultDatasetId } = await waitForTaskCompletion(result.data.id);
    
    // Fetch the job results from the dataset
    const jobsData = await fetchDatasetItems(defaultDatasetId);
    
    // Process and format the job results
    const formattedResults = processJobResults(jobsData, maxResults);
    
    return formattedResults;
  } catch (error) {
    console.error("Error during Apify request:", error);
    throw error;
  }
}

// Wait for the Apify task to complete
async function waitForTaskCompletion(runId: string, maxRetries = 10, delayMs = 3000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get run status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data.status === 'SUCCEEDED') {
        return {
          defaultDatasetId: data.data.defaultDatasetId
        };
      }
      
      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(data.data.status)) {
        throw new Error(`Run failed with status: ${data.data.status}`);
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, delayMs));
    } catch (error) {
      console.error(`Error checking run status (attempt ${i + 1}/${maxRetries}):`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Longer wait on error
      await new Promise(resolve => setTimeout(resolve, delayMs * 2));
    }
  }
  
  throw new Error('Maximum retries reached waiting for task completion');
}

// Fetch items from the Apify dataset
async function fetchDatasetItems(datasetId: string) {
  const response = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyApiKey}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset items: ${response.status}`);
  }
  
  return await response.json();
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
