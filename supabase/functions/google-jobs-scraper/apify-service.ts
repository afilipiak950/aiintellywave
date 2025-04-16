
import { SearchParams, Job } from './types.ts';

const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN') || "apify_api_NOVzYHdbHojPZaa8HlulffsrqBE7Ka1M3y8G";
const apifyApiUrl = `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`;

export async function fetchJobsFromApify(params: SearchParams): Promise<Job[]> {
  try {
    console.log('Starting job fetch with params:', JSON.stringify(params));
    
    // Construct the proper input format for the Apify actor
    const apifyInput = {
      queries: [params.query],
      countryCode: "de",
      languageCode: "de",
      maxItems: params.maxResults || 100,
      includeUnfilteredResults: true,
      csvFriendlyOutput: true,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        countryCode: "DE"
      },
      endPage: 5
    };

    if (params.location) {
      // Add location to the search query
      apifyInput.queries = [`${params.query} ${params.location}`];
    }

    console.log('Sending request to Apify with input:', JSON.stringify(apifyInput));

    const response = await fetch(apifyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyInput)
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status} ${await response.text()}`);
    }

    const results = await response.json();

    if (!Array.isArray(results)) {
      throw new Error('Invalid response format from Apify');
    }

    // Transform Apify response to our Job format
    return results.map((item: any) => {
      // Process apply links to ensure we get the best one
      const directLink = getDirectApplyLink(item.applyLink);
      
      return {
        title: item.title || 'Unknown Title',
        company: item.companyName || 'Unknown Company',
        location: item.location || 'Remote/Flexible',
        description: item.description || 'No description available.',
        url: directLink || '#',
        datePosted: item.metadata?.postedAt || null,
        salary: item.metadata?.salary || null,
        employmentType: item.metadata?.scheduleType || null,
        source: 'Google Jobs',
        directApplyLink: directLink
      };
    });

  } catch (error) {
    console.error('Error fetching from Apify:', error);
    throw error;
  }
}

// Helper function to get the best apply link from the applyLink array
function getDirectApplyLink(applyLinks: any): string {
  if (!applyLinks || !Array.isArray(applyLinks) || applyLinks.length === 0) {
    return '';
  }

  // Prefer direct company career sites or job boards in this order
  const preferredDomains = [
    'karriere.',  // Company career sites in German
    'jobs.',      // Company job sites often start with jobs.
    'careers.',   // Company career sites
    'linkedin.com',
    'indeed.com',
    'stepstone.de',
    'monster.de',
    'xing.com'
  ];

  // Try to find a preferred link first
  for (const domain of preferredDomains) {
    const preferredLink = applyLinks.find((link: any) => 
      link?.link?.toLowerCase().includes(domain)
    );
    if (preferredLink?.link) {
      return preferredLink.link;
    }
  }

  // If no preferred link found, return the first available link
  return applyLinks[0]?.link || '';
}
