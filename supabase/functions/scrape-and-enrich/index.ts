
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables (to be configured in Supabase secrets)
const APOLLO_API_KEY = Deno.env.get("APOLLO_API_KEY") || "";

// HR title variations for search
const HR_TITLES = [
  "HR", "Human Resources", "People", "Talent", "Recruiting",
  "Personnel", "Recruitment", "CHRO", "Chief Human Resources Officer",
  "HR Director", "Human Resources Director", "Head of HR", "Head of Human Resources",
  "HR Manager", "Human Resources Manager", "Personalleiter", "Personalchef",
  "VP of Human Resources", "VP of HR", "Vice President of HR", "Vice President of Human Resources",
  "Head of People", "Chief People Officer", "People Operations", "Recruiter", "Recruiting Manager",
  "HR Business Partner", "Personalsachbearbeiter", "HR Generalist"
];

// Sales title variations for search
const SALES_TITLES = [
  "Sales", "Head of Sales", "Sales Director", "Sales Manager", "Chief Sales Officer",
  "VP of Sales", "Vice President of Sales", "Account Executive", "Sales Representative",
  "Business Development", "BD", "Sales Development", "Vertrieb", "Vertriebsleiter",
  "Vertriebsdirektor", "CRO", "Chief Revenue Officer", "Sales Executive", "Account Manager"
];

serve(async (req) => {
  // Create a request ID for tracking this request through logs
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Starting request processing`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request body
    let debugMode = false;
    let requestTimestamp = new Date().toISOString();
    
    try {
      const body = await req.json();
      debugMode = body?.debug === true;
      requestTimestamp = body?.timestamp || requestTimestamp;
      console.log(`[${requestId}] Request body:`, JSON.stringify(body));
    } catch (e) {
      console.log(`[${requestId}] No request body or invalid JSON`);
    }
    
    console.log(`[${requestId}] Debug mode: ${debugMode}, Request time: ${requestTimestamp}`);
    
    // Enhanced API key validation with detailed logging
    console.log(`[${requestId}] Apollo API Key present:`, APOLLO_API_KEY ? "Yes" : "No");
    console.log(`[${requestId}] Apollo API Key length:`, APOLLO_API_KEY?.length || 0);
    if (APOLLO_API_KEY?.length < 20) {
      console.error(`[${requestId}] APOLLO_API_KEY appears invalid - too short or missing`);
    }
    
    // Check if Apollo API key is available
    if (!APOLLO_API_KEY) {
      console.error(`[${requestId}] APOLLO_API_KEY is not configured`);
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Apollo API-Schlüssel ist nicht konfiguriert. Bitte konfigurieren Sie einen gültigen API-Schlüssel in den Supabase-Secrets.',
          errorDetails: 'Missing API key',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    try {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error(`[${requestId}] Supabase credentials not configured`);
        throw new Error("Supabase configuration is missing");
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log(`[${requestId}] Supabase client initialized successfully`);
      
      // Verify database tables exist and have correct schema
      console.log(`[${requestId}] Verifying job_offers table schema...`);
      const verifyJobOffersTableResult = await verifyJobOffersTable(supabase, requestId);
      if (!verifyJobOffersTableResult.success) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Datenbankschema für job_offers ist fehlerhaft: ' + verifyJobOffersTableResult.error,
            errorDetails: verifyJobOffersTableResult.error,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      console.log(`[${requestId}] Verifying hr_contacts table schema...`);
      const verifyHrContactsTableResult = await verifyHrContactsTable(supabase, requestId);
      if (!verifyHrContactsTableResult.success) {
        return new Response(
          JSON.stringify({
            status: 'error',
            message: 'Datenbankschema für hr_contacts ist fehlerhaft: ' + verifyHrContactsTableResult.error,
            errorDetails: verifyHrContactsTableResult.error,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Build proper headers for Apollo API
      const apolloHeaders = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-API-Key': APOLLO_API_KEY,
        'Authorization': `Bearer ${APOLLO_API_KEY}` // Some Apollo endpoints need this format
      };
      
      console.log(`[${requestId}] Using Apollo API with both header formats for compatibility`);
      
      // Step 1: First check if the API key is valid with a simple request
      console.log(`[${requestId}] Testing Apollo API key with validation request...`);
      const testResponse = await fetch(
        `https://api.apollo.io/v1/auth/health`,
        { 
          method: 'GET', 
          headers: apolloHeaders
        }
      );
      
      // Get full text response for detailed logging
      const testResponseText = await testResponse.text();
      console.log(`[${requestId}] Apollo API Validation Response (${testResponse.status}):`, testResponseText);
      
      let testResponseData;
      try {
        testResponseData = JSON.parse(testResponseText);
        console.log(`[${requestId}] Apollo API Validation Data:`, testResponseData);
      } catch (e) {
        console.error(`[${requestId}] Could not parse Apollo API validation response as JSON:`, e);
      }
      
      if (testResponse.status !== 200) {
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: `Ungültiger Apollo API-Schlüssel. Bitte überprüfen Sie den API-Schlüssel in den Supabase-Secrets.`,
            errorDetails: testResponseText,
            statusCode: testResponse.status
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      console.log(`[${requestId}] Apollo API key validated successfully`);
      
      // Get existing job searches to process from job_search_history
      console.log(`[${requestId}] Fetching job search history to process...`);
      const { data: jobSearches, error: searchError } = await supabase
        .from('job_search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5); // Process latest 5 job searches
      
      if (searchError) {
        console.error(`[${requestId}] Error fetching job searches:`, searchError);
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: 'Fehler beim Abrufen der Jobsuchen: ' + searchError.message,
            errorDetails: JSON.stringify(searchError)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      console.log(`[${requestId}] Retrieved ${jobSearches?.length || 0} job searches`);
      
      if (!jobSearches || jobSearches.length === 0) {
        // If no saved searches, fetch latest from Google Jobs
        console.log(`[${requestId}] No saved job searches found, fetching from Google Jobs...`);
        const googleJobSearch = {
          query: "Software Developer",
          location: "Germany"
        };
        
        const { data: googleJobs, error: googleJobsError } = await fetchGoogleJobs(googleJobSearch.query, googleJobSearch.location);
        
        if (googleJobsError) {
          return new Response(
            JSON.stringify({ 
              status: 'error', 
              message: 'Fehler beim Abrufen von Jobangeboten: ' + googleJobsError,
              errorDetails: googleJobsError
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        console.log(`[${requestId}] Processing ${googleJobs.length} jobs from Google Jobs`);
        const processedJobs = await processAndStoreJobs(googleJobs, supabase, requestId);
        const processedContacts = await findAndStoreHRContacts(processedJobs, apolloHeaders, supabase, requestId);
        
        return new Response(
          JSON.stringify({ 
            status: 'success', 
            jobsProcessed: processedJobs.length,
            contactsFound: processedContacts,
            message: `${processedJobs.length} Jobs und ${processedContacts} HR-Kontakte wurden synchronisiert`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Process each job search
      let totalJobsProcessed = 0;
      let totalContactsFound = 0;
      
      for (const search of jobSearches) {
        console.log(`[${requestId}] Processing job search: ${search.search_query} in ${search.search_location || 'any location'}`);
        
        const searchResults = search.search_results || [];
        if (searchResults.length === 0) {
          console.log(`[${requestId}] No search results found for this search, skipping...`);
          continue;
        }
        
        console.log(`[${requestId}] Found ${searchResults.length} jobs to process in search`);
        
        // Store jobs from this search
        const processedJobs = await processAndStoreJobs(searchResults, supabase, requestId);
        totalJobsProcessed += processedJobs.length;
        
        // Find and store HR contacts for these jobs
        const contactsFound = await findAndStoreHRContacts(processedJobs, apolloHeaders, supabase, requestId);
        totalContactsFound += contactsFound;
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'success', 
          jobsProcessed: totalJobsProcessed,
          contactsFound: totalContactsFound,
          message: `${totalJobsProcessed} Jobs und ${totalContactsFound} HR-Kontakte wurden synchronisiert`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } catch (apolloError) {
      console.error(`[${requestId}] Apollo API error details:`, apolloError);
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: `Apollo API Fehler: ${apolloError.message}`,
          errorDetails: apolloError.toString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

  } catch (error) {
    console.error(`[${requestId}] Scrape and enrich error:`, error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error.message || 'Ein unerwarteter Fehler ist aufgetreten',
        errorDetails: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

// Verify job_offers table has correct schema
async function verifyJobOffersTable(supabase: any, requestId: string): Promise<{success: boolean, error?: string}> {
  try {
    // Check if job_offers table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('job_offers')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error(`[${requestId}] Error checking job_offers table existence:`, tableError);
      return { success: false, error: `Tabelle job_offers existiert nicht oder ist nicht zugänglich: ${tableError.message}` };
    }
    
    // Test inserting a job to check schema
    const testJob = {
      title: "Test Job",
      company_name: "Test Company",
      location: "Test Location",
      description: "Test Description",
      url: "https://example.com/test-job",
      posted_at: new Date().toISOString(),
      source: "test"
    };
    
    const { error: insertError } = await supabase
      .from('job_offers')
      .insert(testJob)
      .select();
      
    if (insertError) {
      console.error(`[${requestId}] Error in job_offers table schema:`, insertError);
      
      // Check if the error is due to missing columns
      if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
        return { 
          success: false, 
          error: `Fehlende Spalte in der job_offers Tabelle: ${insertError.message}. Bitte stellen Sie sicher, dass die Tabelle die Spalten 'title', 'company_name', 'location', 'description', 'url', 'posted_at', 'source' enthält.` 
        };
      }
      
      return { success: false, error: `Schema-Fehler in der job_offers Tabelle: ${insertError.message}` };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`[${requestId}] Error verifying job_offers table:`, error);
    return { success: false, error: `Fehler bei der Überprüfung der job_offers Tabelle: ${error.message}` };
  }
}

// Verify hr_contacts table has correct schema
async function verifyHrContactsTable(supabase: any, requestId: string): Promise<{success: boolean, error?: string}> {
  try {
    // Check if hr_contacts table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('hr_contacts')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.error(`[${requestId}] Error checking hr_contacts table existence:`, tableError);
      return { success: false, error: `Tabelle hr_contacts existiert nicht oder ist nicht zugänglich: ${tableError.message}` };
    }
    
    // Test inserting a contact to check schema - using UUID that exists or null
    const testContact = {
      job_offer_id: null, // Kein job_offer_id benötigt für Test
      full_name: "Test Contact",
      role: "Test Role",
      email: "test@example.com",
      phone: "+1234567890",
      source: "test",
      linkedin_url: "https://linkedin.com/in/test",
      seniority: "Senior",
      department: "HR"
    };
    
    const { error: insertError } = await supabase
      .from('hr_contacts')
      .insert(testContact)
      .select();
      
    if (insertError) {
      console.error(`[${requestId}] Error in hr_contacts table schema:`, insertError);
      
      // Check if the error is due to missing columns
      if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
        return { 
          success: false, 
          error: `Fehlende Spalte in der hr_contacts Tabelle: ${insertError.message}. Bitte stellen Sie sicher, dass die Tabelle die Spalten 'job_offer_id', 'full_name', 'role', 'email', 'phone', 'source', 'linkedin_url', 'seniority', 'department' enthält.` 
        };
      }
      
      return { success: false, error: `Schema-Fehler in der hr_contacts Tabelle: ${insertError.message}` };
    }
    
    // Clean up test data
    await supabase
      .from('hr_contacts')
      .delete()
      .eq('full_name', 'Test Contact')
      .eq('source', 'test');
    
    return { success: true };
  } catch (error) {
    console.error(`[${requestId}] Error verifying hr_contacts table:`, error);
    return { success: false, error: `Fehler bei der Überprüfung der hr_contacts Tabelle: ${error.message}` };
  }
}

// Function to fetch jobs from Google
async function fetchGoogleJobs(query: string, location?: string): Promise<{ data: any[], error: string | null }> {
  try {
    // Mock data for development (normally this would call an actual API)
    const mockData = [
      {
        title: "Software Developer",
        company: "TechCorp GmbH",
        location: "Berlin, Germany",
        description: "We are looking for a talented Software Developer to join our team...",
        url: "https://example.com/job1",
        source: "google_jobs"
      },
      {
        title: "Frontend Engineer",
        company: "WebSolutions",
        location: "Munich, Germany",
        description: "Join our team as a Frontend Engineer...",
        url: "https://example.com/job2",
        source: "google_jobs"
      }
    ];
    
    return { data: mockData, error: null };
  } catch (error) {
    console.error("Error fetching Google jobs:", error);
    return { data: [], error: error.message };
  }
}

// Function to process and store jobs
async function processAndStoreJobs(jobs: any[], supabase: any, requestId: string): Promise<any[]> {
  console.log(`[${requestId}] Processing ${jobs.length} jobs...`);
  const processedJobs = [];
  
  for (const job of jobs) {
    try {
      // Normalize job data
      const jobData = {
        title: job.title || 'Unknown Title',
        company_name: job.company || 'Unknown Company',
        location: job.location || 'Unknown Location',
        description: job.description || '',
        url: job.url || '',
        posted_at: job.datePosted ? new Date(job.datePosted).toISOString() : new Date().toISOString(),
        source: job.source || 'google_jobs',
        company_domain: extractDomainFromCompanyName(job.company)
      };
      
      console.log(`[${requestId}] Processing job: ${jobData.title} at ${jobData.company_name}, URL: ${jobData.url}`);
      
      // Check if job already exists to avoid duplicates
      const { data: existingJobs, error: checkError } = await supabase
        .from('job_offers')
        .select('id')
        .eq('company_name', jobData.company_name)
        .eq('title', jobData.title)
        .limit(1);
      
      if (checkError) {
        console.error(`[${requestId}] Error checking existing job:`, checkError);
        continue;
      }
      
      let jobId;
      
      if (existingJobs && existingJobs.length > 0) {
        // Job exists, update it
        jobId = existingJobs[0].id;
        console.log(`[${requestId}] Updating existing job (ID: ${jobId}): ${jobData.title} at ${jobData.company_name}`);
        
        const { error: updateError } = await supabase
          .from('job_offers')
          .update({
            title: jobData.title,
            company_name: jobData.company_name,
            location: jobData.location,
            description: jobData.description,
            url: jobData.url,
            posted_at: jobData.posted_at,
            source: jobData.source
          })
          .eq('id', jobId);
          
        if (updateError) {
          console.error(`[${requestId}] Error updating job:`, updateError);
          continue;
        }
        console.log(`[${requestId}] Successfully updated job with ID: ${jobId}`);
      } else {
        // Job doesn't exist, insert it
        console.log(`[${requestId}] Inserting new job: ${jobData.title} at ${jobData.company_name}`);
        const { data: insertedJob, error: insertError } = await supabase
          .from('job_offers')
          .insert({
            title: jobData.title,
            company_name: jobData.company_name,
            location: jobData.location,
            description: jobData.description,
            url: jobData.url,
            posted_at: jobData.posted_at,
            source: jobData.source
          })
          .select();
          
        if (insertError) {
          console.error(`[${requestId}] Error inserting job:`, insertError);
          console.log(`[${requestId}] Insert job error details:`, JSON.stringify(insertError));
          continue;
        }
        
        if (insertedJob && insertedJob.length > 0) {
          jobId = insertedJob[0].id;
          console.log(`[${requestId}] Successfully inserted job with ID: ${jobId}`);
        } else {
          console.error(`[${requestId}] Job inserted but no ID returned`);
          continue;
        }
      }
      
      // Add the processed job to our list
      processedJobs.push({
        id: jobId,
        title: jobData.title,
        company: jobData.company_name,
        location: jobData.location,
        description: jobData.description,
        url: jobData.url,
        source: jobData.source,
        companyDomain: jobData.company_domain
      });
      
    } catch (err) {
      console.error(`[${requestId}] Error processing job ${job.title}:`, err);
    }
  }
  
  console.log(`[${requestId}] Successfully processed ${processedJobs.length} jobs`);
  return processedJobs;
}

// Function to find and store HR contacts
async function findAndStoreHRContacts(jobs: any[], headers: HeadersInit, supabase: any, requestId: string): Promise<number> {
  console.log(`[${requestId}] Finding HR contacts for ${jobs.length} companies...`);
  let totalContactsFound = 0;
  
  for (const job of jobs) {
    try {
      console.log(`[${requestId}] Searching HR contacts for company: ${job.company}`);
      
      const companyDomain = job.companyDomain || extractDomainFromCompanyName(job.company);
      let contactSearchCriteria: any = {};
      
      // If we have a domain, search by domain, otherwise by company name
      if (companyDomain) {
        console.log(`[${requestId}] Using domain for search: ${companyDomain}`);
        contactSearchCriteria = {
          organization_domains: [companyDomain],
          page: 1,
          per_page: 10,
          contact_email_status: ["verified"]
        };
      } else {
        console.log(`[${requestId}] Using company name for search: ${job.company}`);
        contactSearchCriteria = {
          q_organization_name: job.company,
          page: 1, 
          per_page: 10,
          contact_email_status: ["verified"]
        };
      }
      
      // Add detailed logging for Apollo API request
      console.log(`[${requestId}] Apollo search request details:`, {
        endpoint: 'https://api.apollo.io/v1/people/search',
        method: 'POST',
        criteria: JSON.stringify(contactSearchCriteria),
        headersKeys: Object.keys(headers)
      });
      
      // Search for HR contacts
      console.log(`[${requestId}] Searching for HR contacts...`);
      const hrContacts = await searchContactsByTitles(contactSearchCriteria, HR_TITLES, headers, requestId);
      console.log(`[${requestId}] Found ${hrContacts.length} HR contacts`);
      
      // Search for Sales contacts if HR contacts are limited
      let salesContacts: any[] = [];
      if (hrContacts.length < 2) {
        console.log(`[${requestId}] Limited HR contacts, searching for Sales contacts...`);
        salesContacts = await searchContactsByTitles(contactSearchCriteria, SALES_TITLES, headers, requestId);
        console.log(`[${requestId}] Found ${salesContacts.length} Sales contacts`);
      }
      
      // Combine contacts (prioritizing HR)
      const contacts = [...hrContacts, ...salesContacts];
      console.log(`[${requestId}] Total combined contacts: ${contacts.length}`);
      totalContactsFound += contacts.length;
      
      // Store the contacts
      for (const contact of contacts) {
        try {
          // Check if we have all required columns
          const contactData: any = {
            job_offer_id: job.id || null, // Erlaube null-Werte
            full_name: contact.name || 'Unknown',
            role: contact.title || 'Unknown Role',
            email: contact.email || null,
            phone: contact.phone_number || null,
            source: 'apollo_io'
          };
          
          // Add the new fields if they exist
          if (contact.linkedin_url) contactData.linkedin_url = contact.linkedin_url;
          if (contact.seniority) contactData.seniority = contact.seniority;
          if (contact.department || getContactDepartment(contact)) {
            contactData.department = contact.department || getContactDepartment(contact);
          }
          
          console.log(`[${requestId}] Contact data to store:`, JSON.stringify(contactData));
          
          // Check if contact already exists to avoid duplicates - using a more robust check
          const { data: existingContacts, error: checkError } = await supabase
            .from('hr_contacts')
            .select('id')
            .eq('full_name', contactData.full_name)
            .eq('source', 'apollo_io')
            .limit(1);
            
          if (checkError) {
            console.error(`[${requestId}] Error checking existing contact:`, checkError);
            continue;
          }
          
          if (existingContacts && existingContacts.length > 0) {
            // Contact exists, update it
            console.log(`[${requestId}] Updating existing contact: ${contactData.full_name}`);
            const { error: updateError } = await supabase
              .from('hr_contacts')
              .update(contactData)
              .eq('id', existingContacts[0].id);
              
            if (updateError) {
              console.error(`[${requestId}] Error updating contact:`, updateError);
              console.log(`[${requestId}] Update contact error details:`, JSON.stringify(updateError));
            } else {
              console.log(`[${requestId}] Successfully updated contact: ${contactData.full_name}`);
            }
          } else {
            // Contact doesn't exist, insert it
            console.log(`[${requestId}] Inserting new contact: ${contactData.full_name}`);
            const { data: insertedContact, error: insertError } = await supabase
              .from('hr_contacts')
              .insert(contactData)
              .select();
              
            if (insertError) {
              console.error(`[${requestId}] Error inserting contact:`, insertError);
              console.log(`[${requestId}] Insert contact error details:`, JSON.stringify(insertError));
            } else {
              console.log(`[${requestId}] Successfully inserted contact: ${contactData.full_name}`);
            }
          }
        } catch (err) {
          console.error(`[${requestId}] Error processing contact ${contact.name}:`, err);
        }
      }
    } catch (err) {
      console.error(`[${requestId}] Error finding contacts for ${job.company}:`, err);
    }
  }
  
  return totalContactsFound;
}

// Helper function to search contacts by titles
async function searchContactsByTitles(
  baseCriteria: any, 
  titles: string[], 
  headers: HeadersInit,
  requestId: string
): Promise<any[]> {
  try {
    // Add titles to search criteria
    const searchCriteria = { ...baseCriteria, person_titles: titles };
    
    console.log(`[${requestId}] Apollo search criteria:`, JSON.stringify(searchCriteria));
    
    // Make request to Apollo API
    console.log(`[${requestId}] Making Apollo API request to /v1/people/search`);
    
    // Log headers (without the actual key values)
    console.log(`[${requestId}] Request headers:`, Object.keys(headers).join(', '));
    
    // Make the actual API request with retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch(
          `https://api.apollo.io/v1/people/search`,
          { 
            method: 'POST',
            headers: headers,
            body: JSON.stringify(searchCriteria)
          }
        );
        
        // If we got a response, break out of retry loop
        break;
      } catch (fetchError) {
        retryCount++;
        console.error(`[${requestId}] Fetch error on attempt ${retryCount}:`, fetchError);
        
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }
    
    if (!response) {
      throw new Error('Failed to get response from Apollo API after multiple attempts');
    }
    
    console.log(`[${requestId}] Apollo API response status: ${response.status}`);
    console.log(`[${requestId}] Apollo API response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${requestId}] Apollo API error (${response.status}):`, errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error(`[${requestId}] Apollo API error details:`, errorData);
      } catch (e) {
        console.error(`[${requestId}] Could not parse error response as JSON`);
      }
      
      // Rate limit handling
      if (response.status === 429) {
        console.error(`[${requestId}] Apollo API rate limit exceeded. Consider implementing delay between requests.`);
      }
      
      return [];
    }
    
    // Get the full response text for detailed logging
    const responseText = await response.text();
    console.log(`[${requestId}] Apollo API raw response (first 500 chars):`, responseText.substring(0, 500) + '...');
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error(`[${requestId}] Error parsing Apollo API response:`, e);
      return [];
    }
    
    console.log(`[${requestId}] Apollo API returned ${data.people?.length || 0} contacts`);
    
    // Log some sample contact data for debugging if available
    if (data.people && data.people.length > 0) {
      const sampleContact = data.people[0];
      console.log(`[${requestId}] Sample contact fields:`, Object.keys(sampleContact).join(', '));
      console.log(`[${requestId}] Sample contact data:`, JSON.stringify({
        name: sampleContact.name,
        title: sampleContact.title,
        email: sampleContact.email,
        linkedin: sampleContact.linkedin_url,
        seniority: sampleContact.seniority
      }));
    }
    
    return data.people || [];
  } catch (error) {
    console.error(`[${requestId}] Error searching contacts by titles:`, error);
    return [];
  }
}

// Helper function to extract domain from company name
function extractDomainFromCompanyName(companyName: string): string | null {
  if (!companyName) return null;
  
  try {
    // Remove common company suffixes
    const cleanName = companyName
      .replace(/\s+(GmbH|AG|Inc\.|LLC|Ltd\.|Limited|Corp\.|Corporation|SE|KG|OHG|e\.V\.)$/i, '')
      .replace(/[^\w\s]/g, '')  // Remove punctuation
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
      
    if (cleanName) {
      return `${cleanName}.com`;
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting domain:", error);
    return null;
  }
}

// Helper function to determine department from contact data
function getContactDepartment(contact: any): string | null {
  if (!contact || !contact.title) return null;
  
  const title = contact.title.toLowerCase();
  
  if (title.includes('hr') || 
      title.includes('human resources') || 
      title.includes('people') || 
      title.includes('talent') || 
      title.includes('recruiting') || 
      title.includes('personal')) {
    return 'Human Resources';
  }
  
  if (title.includes('sales') || 
      title.includes('account') || 
      title.includes('business development') || 
      title.includes('vertrieb')) {
    return 'Sales';
  }
  
  if (title.includes('market')) {
    return 'Marketing';
  }
  
  if (title.includes('finance') || 
      title.includes('accounting') || 
      title.includes('finanzen')) {
    return 'Finance';
  }
  
  if (title.includes('engineering') || 
      title.includes('develop') || 
      title.includes('software') || 
      title.includes('tech')) {
    return 'Engineering';
  }
  
  if (title.includes('ceo') || 
      title.includes('cto') || 
      title.includes('cfo') || 
      title.includes('chief') || 
      title.includes('president') || 
      title.includes('director') || 
      title.includes('head')) {
    return 'Executive';
  }
  
  return null;
}
