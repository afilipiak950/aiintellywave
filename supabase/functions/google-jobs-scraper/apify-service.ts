
import { ApifyInput, ApifyResult, FormattedJob, SearchParams } from './types.ts';
import { apifyActorUrl, apifyToken } from './config.ts';

export async function fetchJobsFromApify(searchParams: SearchParams): Promise<FormattedJob[]> {
  if (!apifyToken) {
    throw new Error('Apify API-Token ist nicht konfiguriert');
  }
  
  // Prepare the Apify input payload
  const apifyInput: ApifyInput = {
    queries: [{
      searchTerm: searchParams.query,
      location: searchParams.location || '',
      language: 'DE', // Default to German
    }],
    maxPagesPerQuery: 10, // Increased from 5 to 10 to ensure we get enough results for 50 unique companies
    proxyConfiguration: { useApifyProxy: false }
  };
  
  console.log('Sending request to Apify with input:', JSON.stringify(apifyInput));
  
  // Call Apify API with the direct run-sync-get-dataset-items endpoint
  const apifyUrl = `${apifyActorUrl}?token=${apifyToken}`;
  
  // Add timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout (increased from 60)
  
  try {
    // Send the request to Apify
    const apifyResponse = await fetch(apifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apifyInput),
      signal: controller.signal
    });
    
    // Clear timeout as request completed
    clearTimeout(timeoutId);
    
    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', apifyResponse.status, errorText);
      console.error('Request payload was:', JSON.stringify(apifyInput));
      throw new Error(`Apify API-Fehler: ${apifyResponse.status} - ${errorText}`);
    }
    
    try {
      // Parse the response from Apify - this directly contains the job items
      const jobItems: ApifyResult[] = await apifyResponse.json();
      console.log(`Retrieved ${jobItems.length} total job items from Apify`);
      
      if (!jobItems || jobItems.length === 0) {
        console.error('No job items returned from Apify, response was empty array or null');
        return [];
      }
      
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
      
      console.log(`Formatted ${formattedJobs.length} job listings`);
      
      // Filter for unique companies
      const uniqueJobs: FormattedJob[] = [];
      const companySet = new Set<string>();
      
      // Then filter for unique companies
      for (const job of formattedJobs) {
        if (job.company && !companySet.has(job.company)) {
          uniqueJobs.push(job);
          companySet.add(job.company);
          
          // Break once we have 50 unique companies
          if (uniqueJobs.length >= 50) {
            break;
          }
        }
      }
      
      console.log(`Filtered to ${uniqueJobs.length} unique company job listings`);
      
      if (uniqueJobs.length === 0 && formattedJobs.length > 0) {
        console.warn('No unique jobs found after filtering. Check company name field in results.');
        // Return all jobs as fallback (up to 50)
        return formattedJobs.slice(0, 50);
      }
      
      return uniqueJobs;
    } catch (parseError) {
      console.error('Error parsing Apify response:', parseError);
      console.error('Response status:', apifyResponse.status);
      console.error('Response headers:', Object.fromEntries(apifyResponse.headers.entries()));
      
      // Try to get response text for debugging
      try {
        const responseText = await apifyResponse.text();
        console.error('Response text (first 500 chars):', responseText.substring(0, 500));
      } catch (e) {
        console.error('Could not read response text:', e);
      }
      
      throw new Error(`Fehler beim Parsen der Apify-Antwort: ${parseError.message}`);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Die Anfrage an Apify hat das Zeitlimit überschritten. Bitte versuchen Sie es später erneut.');
    }
    
    console.error('Error during Apify request:', error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
