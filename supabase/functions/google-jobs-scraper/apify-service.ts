
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
    maxPagesPerQuery: 2,
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
  
  // Format the job results
  return jobItems.map(item => ({
    title: item.title || '',
    company: item.company || '',
    location: item.location || '',
    description: item.description || '',
    url: item.url || '',
    datePosted: item.date || '',
    salary: item.salary || '',
    employmentType: item.employmentType || '',
    source: 'google-jobs'
  })).slice(0, searchParams.maxResults || 100);
}
