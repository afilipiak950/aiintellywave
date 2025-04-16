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
      maxItems: 50, // Always request exactly 50 items
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

    // Ensure we only return at most 50 jobs
    const limitedResults = Array.isArray(results) ? results.slice(0, 50) : [];

    // Transform Apify response to our Job format
    return limitedResults.map((item: any) => {
      // Process apply links to ensure we get the best one
      const directLink = getDirectApplyLink(item.applyLink);
      
      // Handle date safely
      let postedDate = null;
      if (item.metadata?.postedAt) {
        try {
          // Validate the date
          const date = new Date(item.metadata.postedAt);
          if (!isNaN(date.getTime())) {
            postedDate = item.metadata.postedAt;
          }
        } catch (e) {
          console.warn('Invalid date format:', item.metadata.postedAt);
        }
      }
      
      return {
        title: item.title || 'Unknown Title',
        company: item.companyName || 'Unknown Company',
        location: item.location || 'Remote/Flexible',
        description: item.description || 'No description available.',
        url: validateUrl(directLink) || createFallbackUrl(item.title, item.companyName),
        datePosted: postedDate,
        salary: item.metadata?.salary || null,
        employmentType: item.metadata?.scheduleType || null,
        source: 'Google Jobs',
        directApplyLink: validateUrl(directLink)
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

// Helper function to validate URL
function validateUrl(url: string): string {
  if (!url) return '';
  
  // Add https:// if the URL doesn't have a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

// Helper function to create a fallback URL
function createFallbackUrl(title: string, company: string): string {
  const searchQuery = encodeURIComponent(`${title || ''} ${company || ''} job`);
  return `https://www.google.com/search?q=${searchQuery}`;
}
