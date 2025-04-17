
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Log the API key status for debugging (only logging if present, not the actual key)
    console.log("Apollo API Key present:", APOLLO_API_KEY ? "Yes" : "No");
    console.log("Apollo API Key length:", APOLLO_API_KEY?.length || 0);
    
    // Check if Apollo API key is available
    if (!APOLLO_API_KEY) {
      console.error("APOLLO_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Apollo API-Schlüssel ist nicht konfiguriert. Bitte konfigurieren Sie einen gültigen API-Schlüssel in den Projekteinstellungen.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    try {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase credentials not configured");
        throw new Error("Supabase configuration is missing");
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Build proper headers for Apollo API
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-API-Key': APOLLO_API_KEY
      };
      
      console.log("Using Apollo API with direct API key header");
      
      // Step 1: First check if the API key is valid with a simple request
      console.log("Testing Apollo API key with validation request...");
      const testResponse = await fetch(
        `https://api.apollo.io/v1/auth/health`,
        { 
          method: 'GET', 
          headers: headers
        }
      );
      
      const testResponseText = await testResponse.text();
      console.log("Apollo API Validation Response:", testResponse.status, testResponseText);
      
      if (testResponse.status !== 200) {
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: `Ungültiger Apollo API-Schlüssel. Bitte überprüfen Sie den API-Schlüssel in den Projekteinstellungen.`,
            errorDetails: testResponseText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Get existing job searches to process from job_search_history
      console.log("Fetching job search history to process...");
      const { data: jobSearches, error: searchError } = await supabase
        .from('job_search_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5); // Process latest 5 job searches
      
      if (searchError) {
        console.error("Error fetching job searches:", searchError);
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: 'Fehler beim Abrufen der Jobsuchen: ' + searchError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      if (!jobSearches || jobSearches.length === 0) {
        // If no saved searches, fetch latest from Google Jobs
        console.log("No saved job searches found, fetching from Google Jobs...");
        const googleJobSearch = {
          query: "Software Developer",
          location: "Germany"
        };
        
        const { data: googleJobs, error: googleJobsError } = await fetchGoogleJobs(googleJobSearch.query, googleJobSearch.location);
        
        if (googleJobsError) {
          return new Response(
            JSON.stringify({ 
              status: 'error', 
              message: 'Fehler beim Abrufen von Jobangeboten: ' + googleJobsError
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        const processedJobs = await processAndStoreJobs(googleJobs, supabase);
        const processedContacts = await findAndStoreHRContacts(processedJobs, headers, supabase);
        
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
        console.log(`Processing job search: ${search.search_query} in ${search.search_location || 'any location'}`);
        
        const searchResults = search.search_results || [];
        if (searchResults.length === 0) {
          console.log("No search results found for this search, skipping...");
          continue;
        }
        
        // Store jobs from this search
        const processedJobs = await processAndStoreJobs(searchResults, supabase);
        totalJobsProcessed += processedJobs.length;
        
        // Find and store HR contacts for these jobs
        const contactsFound = await findAndStoreHRContacts(processedJobs, headers, supabase);
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
      console.error("Apollo API error details:", apolloError);
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
    console.error('Scrape and enrich error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error.message || 'Ein unerwarteter Fehler ist aufgetreten'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

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
async function processAndStoreJobs(jobs: any[], supabase: any): Promise<any[]> {
  console.log(`Processing ${jobs.length} jobs...`);
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
      
      // Check if job already exists to avoid duplicates
      const { data: existingJobs, error: checkError } = await supabase
        .from('job_offers')
        .select('id')
        .eq('company_name', jobData.company_name)
        .eq('title', jobData.title)
        .limit(1);
      
      if (checkError) {
        console.error("Error checking existing job:", checkError);
        continue;
      }
      
      let jobId;
      
      if (existingJobs && existingJobs.length > 0) {
        // Job exists, update it
        console.log(`Updating existing job: ${jobData.title} at ${jobData.company_name}`);
        jobId = existingJobs[0].id;
        
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
          console.error("Error updating job:", updateError);
          continue;
        }
      } else {
        // Job doesn't exist, insert it
        console.log(`Inserting new job: ${jobData.title} at ${jobData.company_name}`);
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
          console.error("Error inserting job:", insertError);
          continue;
        }
        
        if (insertedJob && insertedJob.length > 0) {
          jobId = insertedJob[0].id;
        } else {
          console.error("Job inserted but no ID returned");
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
      console.error(`Error processing job ${job.title}:`, err);
    }
  }
  
  console.log(`Successfully processed ${processedJobs.length} jobs`);
  return processedJobs;
}

// Function to find and store HR contacts
async function findAndStoreHRContacts(jobs: any[], headers: HeadersInit, supabase: any): Promise<number> {
  console.log(`Finding HR contacts for ${jobs.length} companies...`);
  let totalContactsFound = 0;
  
  for (const job of jobs) {
    try {
      console.log(`Searching HR contacts for company: ${job.company}`);
      
      const companyDomain = job.companyDomain || extractDomainFromCompanyName(job.company);
      let contactSearchCriteria: any = {};
      
      // If we have a domain, search by domain, otherwise by company name
      if (companyDomain) {
        console.log(`Using domain for search: ${companyDomain}`);
        contactSearchCriteria = {
          organization_domains: [companyDomain],
          page: 1,
          per_page: 10,
          contact_email_status: ["verified"]
        };
      } else {
        console.log(`Using company name for search: ${job.company}`);
        contactSearchCriteria = {
          q_organization_name: job.company,
          page: 1, 
          per_page: 10,
          contact_email_status: ["verified"]
        };
      }
      
      // Search for HR contacts
      console.log("Searching for HR contacts...");
      const hrContacts = await searchContactsByTitles(contactSearchCriteria, HR_TITLES, headers);
      console.log(`Found ${hrContacts.length} HR contacts`);
      
      // Search for Sales contacts if HR contacts are limited
      let salesContacts: any[] = [];
      if (hrContacts.length < 2) {
        console.log("Limited HR contacts, searching for Sales contacts...");
        salesContacts = await searchContactsByTitles(contactSearchCriteria, SALES_TITLES, headers);
        console.log(`Found ${salesContacts.length} Sales contacts`);
      }
      
      // Combine contacts (prioritizing HR)
      const contacts = [...hrContacts, ...salesContacts];
      console.log(`Total combined contacts: ${contacts.length}`);
      totalContactsFound += contacts.length;
      
      // Store the contacts
      for (const contact of contacts) {
        try {
          const contactData = {
            job_offer_id: job.id,
            full_name: contact.name || 'Unknown',
            role: contact.title || 'Unknown Role',
            email: contact.email || null,
            phone: contact.phone_number || null,
            linkedin_url: contact.linkedin_url || null,
            seniority: contact.seniority || null,
            department: contact.department || getContactDepartment(contact),
            source: 'apollo_io'
          };
          
          // Check if contact already exists to avoid duplicates
          const { data: existingContacts, error: checkError } = await supabase
            .from('hr_contacts')
            .select('id')
            .eq('job_offer_id', contactData.job_offer_id)
            .eq('email', contactData.email)
            .limit(1);
            
          if (checkError) {
            console.error("Error checking existing contact:", checkError);
            continue;
          }
          
          if (existingContacts && existingContacts.length > 0) {
            // Contact exists, update it
            console.log(`Updating existing contact: ${contactData.full_name}`);
            const { error: updateError } = await supabase
              .from('hr_contacts')
              .update(contactData)
              .eq('id', existingContacts[0].id);
              
            if (updateError) {
              console.error("Error updating contact:", updateError);
            }
          } else {
            // Contact doesn't exist, insert it
            console.log(`Inserting new contact: ${contactData.full_name}`);
            const { error: insertError } = await supabase
              .from('hr_contacts')
              .insert(contactData);
              
            if (insertError) {
              console.error("Error inserting contact:", insertError);
            }
          }
        } catch (err) {
          console.error(`Error processing contact ${contact.name}:`, err);
        }
      }
    } catch (err) {
      console.error(`Error finding contacts for ${job.company}:`, err);
    }
  }
  
  return totalContactsFound;
}

// Helper function to search contacts by titles
async function searchContactsByTitles(
  baseCriteria: any, 
  titles: string[], 
  headers: HeadersInit
): Promise<any[]> {
  try {
    // Add titles to search criteria
    const searchCriteria = { ...baseCriteria, person_titles: titles };
    
    console.log("Apollo search criteria:", JSON.stringify(searchCriteria));
    
    // Make request to Apollo API
    const response = await fetch(
      `https://api.apollo.io/v1/people/search`,
      { 
        method: 'POST',
        headers: headers,
        body: JSON.stringify(searchCriteria)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Apollo API error: ${response.status}`, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log(`Apollo API returned ${data.people?.length || 0} contacts`);
    
    return data.people || [];
  } catch (error) {
    console.error("Error searching contacts by titles:", error);
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
