
import { ApifyInput, ApifyResult, FormattedJob, SearchParams } from './types.ts';
import { apifyActorUrl, apifyToken } from './config.ts';

export async function fetchJobsFromApify(searchParams: SearchParams): Promise<FormattedJob[]> {
  if (!apifyToken) {
    throw new Error('Apify API token is not configured');
  }
  
  // Prepare the Apify input payload
  const apifyInput: ApifyInput = {
    queries: [{
      searchTerm: searchParams.query,
      location: searchParams.location || '',
      language: 'DE', // Default to German
    }],
    maxPagesPerQuery: 5, // Increased from 2 to 5 to ensure we get enough results
    proxyConfiguration: { useApifyProxy: false }
  };
  
  console.log('Sending request to Apify with input:', JSON.stringify(apifyInput));
  
  // Call Apify API with the direct run-sync-get-dataset-items endpoint
  const apifyUrl = `${apifyActorUrl}?token=${apifyToken}`;
  
  // Send the request to Apify
  const apifyResponse = await fetch(apifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apifyInput),
  });
  
  if (!apifyResponse.ok) {
    const errorText = await apifyResponse.text();
    console.error('Apify API error:', apifyResponse.status, errorText);
    throw new Error(`Apify API error: ${apifyResponse.status} - ${errorText}`);
  }
  
  // Parse the response from Apify - this directly contains the job items
  const jobItems: ApifyResult[] = await apifyResponse.json();
  console.log(`Retrieved ${jobItems.length} job items from Apify`);
  
  // Filter for unique companies (only one job per company)
  const uniqueJobs: FormattedJob[] = [];
  const companySet = new Set<string>();
  
  // First, format all the job results
  const formattedJobs = jobItems.map(item => ({
    title: item.title || '',
    company: item.company || '',
    location: item.location || '',
    description: item.description || '',
    url: item.url || '',
    datePosted: item.date || '',
    salary: item.salary || '',
    employmentType: item.employmentType || '',
    source: 'google-jobs'
  }));
  
  // Then filter for unique companies
  for (const job of formattedJobs) {
    if (!companySet.has(job.company) && job.company) {
      uniqueJobs.push(job);
      companySet.add(job.company);
      
      // Break once we have 50 unique companies
      if (uniqueJobs.length >= 50) {
        break;
      }
    }
  }
  
  console.log(`Filtered to ${uniqueJobs.length} unique company job listings`);
  return uniqueJobs;
}
