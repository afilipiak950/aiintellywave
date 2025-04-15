
import { SearchParams, Job } from './types.ts';

// Define the URL for the Apify API
const apifyApiUrl = "https://api.apify.com/v2/acts/kranvad~google-jobs-scraper/runs?token=apify_api_J6jq0xMdyXoUgVtPb0b00oLGU4bsdd2zZSej";

/**
 * Fetches job listings from Google Jobs via Apify API
 * @param params Search parameters for Google Jobs
 * @returns Array of job listings
 */
export async function fetchJobsFromApify(params: SearchParams): Promise<Job[]> {
  try {
    // Construct Google Jobs URL
    const baseUrl = "https://www.google.com/search?q=";
    const jobSuffix = "&ibp=htl;jobs";
    
    // Sanitize and encode query properly
    const query = encodeURIComponent(params.query.trim());
    
    // Build the URL with proper encoding
    let googleJobsUrl = `${baseUrl}${query}${jobSuffix}`;
    
    // Add location if provided
    if (params.location) {
      googleJobsUrl += `&location=${encodeURIComponent(params.location.trim())}`;
    }
    
    console.log(`Generated Google Jobs URL: ${googleJobsUrl}`);
    
    // Set up request to Apify API
    const requestBody = {
      startUrls: [{ url: googleJobsUrl }],
      maxItems: params.maxResults || 100, // Request more results, with 100 as default
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"]
      },
      endPage: 5, // Increase from default 3 to get more results
      includeUnfilteredResults: false,
      countryCode: "de",
      languageCode: "de"
    };
    
    console.log(`Sending request to Apify with input:`, JSON.stringify(requestBody));
    
    // Make request to Apify API with 45 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    const response = await fetch(apifyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apify API error: ${response.status} ${errorText}`);
      return getFallbackJobData(params);
    }
    
    const data = await response.json();
    
    if (!data || !data.data || !data.data.items || !Array.isArray(data.data.items)) {
      console.error("Invalid response from Apify API:", data);
      return getFallbackJobData(params);
    }
    
    // Transform Apify response to our Job type
    return data.data.items.map((item: any) => ({
      title: item.title || 'Unbekannter Jobtitel',
      company: item.company || 'Unbekanntes Unternehmen',
      location: item.location || 'Remote/Flexibel',
      description: item.description || 'Keine Beschreibung verfügbar.',
      url: item.url || '#',
      datePosted: item.date || null,
      salary: item.salary || null,
      employmentType: item.employmentType || null,
      source: 'Google Jobs'
    }));
    
  } catch (error) {
    console.error("Apify API failed. Returning fallback mock data.");
    return getFallbackJobData(params);
  }
}

/**
 * Provides fallback job data when the Apify API fails
 * @param params Search parameters used for generating relevant fallback data
 * @returns Array of mock job listings
 */
function getFallbackJobData(params: SearchParams): Job[] {
  // Create 100 mock job listings for fallback
  const mockJobs: Job[] = [];
  const companies = [
    "Tech Solutions GmbH", "Digital Innovations AG", "Future Systems", 
    "Data Experts Berlin", "Smart Tech Solutions", "Innovation Hub", 
    "Next Level IT", "Technologie Zentrum", "Digital Makers", "Coding Factory"
  ];
  
  const locations = [
    "Berlin", "München", "Hamburg", "Frankfurt", "Köln", 
    "Stuttgart", "Düsseldorf", "Remote", "Leipzig", "Dresden"
  ];
  
  const jobTitles = [
    `${params.query} Specialist`, `Senior ${params.query}`, `${params.query} Manager`, 
    `${params.query} Developer`, `${params.query} Engineer`, `${params.query} Consultant`, 
    `Lead ${params.query}`, `${params.query} Architect`, `Junior ${params.query}`, `${params.query} Analyst`
  ];
  
  // Generate 100 mock job listings
  for (let i = 0; i < 100; i++) {
    const titleIndex = i % jobTitles.length;
    const companyIndex = i % companies.length;
    const locationIndex = i % locations.length;
    
    mockJobs.push({
      title: jobTitles[titleIndex],
      company: companies[companyIndex],
      location: params.location || locations[locationIndex],
      description: `Dies ist eine Beispiel-Jobbeschreibung für die Position "${jobTitles[titleIndex]}" bei ${companies[companyIndex]}. Diese Ergebnisse werden angezeigt, weil die Google Jobs API derzeit nicht verfügbar ist.`,
      url: "#",
      datePosted: new Date().toISOString(),
      salary: "Nach Vereinbarung",
      employmentType: "Vollzeit",
      source: "Fallback (Apify API nicht verfügbar)"
    });
  }
  
  return mockJobs;
}
