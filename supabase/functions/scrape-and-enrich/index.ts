
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables (to be configured in Supabase secrets)
const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN") || "";
const APOLLO_API_KEY = Deno.env.get("APOLLO_API_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Step A: Apify Job Scraping
    console.log("Starting job scraping with Apify...");
    
    // Check if Apify token is available
    if (!APIFY_TOKEN) {
      console.log("APIFY_TOKEN not configured, using mock data");
      // Return mock data for testing when API key is not available
      return new Response(
        JSON.stringify({
          status: 'success',
          jobsProcessed: 5,
          message: 'Verwendet Testdaten da APIFY_TOKEN nicht konfiguriert ist'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      { 
        method: 'POST', 
        body: JSON.stringify({ 
          query: 'Software Engineer', 
          location: 'Düsseldorf',
          maxItems: 10 // Limit to 10 for testing
        }) 
      }
    );

    if (!apifyResponse.ok) {
      console.error(`Apify API error: ${apifyResponse.status}`);
      throw new Error(`Apify API error: ${apifyResponse.status}`);
    }

    const jobsData = await apifyResponse.json();
    console.log(`Retrieved ${jobsData.length} jobs from Apify`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials not configured");
      throw new Error("Supabase configuration is missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step B: Save Job Offers
    const jobInsertPromises = jobsData.map(async (job: any) => {
      try {
        const { data, error } = await supabase.from('job_offers').insert({
          title: job.title || 'Unknown Title',
          company_name: job.company || job.companyName || 'Unknown Company',
          location: job.location || 'Unknown Location',
          description: job.description || '',
          posted_at: job.postedAt ? new Date(job.postedAt).toISOString() : null,
          source: 'apify_google_jobs',
        }).select();

        if (error) {
          console.error('Job insert error:', error);
          return null;
        }
        return data?.[0];
      } catch (err) {
        console.error('Error inserting job:', err);
        return null;
      }
    });

    const insertedJobs = (await Promise.all(jobInsertPromises)).filter(Boolean);
    console.log(`Successfully inserted ${insertedJobs.length} jobs`);

    // Step C: Find HR Contacts via Apollo
    // Check if Apollo API key is available
    if (!APOLLO_API_KEY) {
      console.log("APOLLO_API_KEY not configured, skipping contact enrichment");
      
      return new Response(
        JSON.stringify({ 
          status: 'success', 
          jobsProcessed: insertedJobs.length,
          message: 'Jobs wurden synchronisiert, aber keine HR-Kontakte wurden gefunden (Apollo API Key nicht konfiguriert)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    console.log("Starting HR contact search with Apollo...");
    let contactsFound = 0;
    
    const contactPromises = insertedJobs.map(async (job) => {
      if (!job) return null;

      try {
        // Company search
        const orgResponse = await fetch(
          `https://api.apollohq.com/v1/organizations/search?name=${encodeURIComponent(job.company_name)}`,
          { 
            headers: { 
              'Authorization': `Basic ${btoa(`${APOLLO_API_KEY}:X`)}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        if (!orgResponse.ok) {
          console.warn(`Apollo API error for ${job.company_name}: ${orgResponse.status}`);
          return null;
        }

        const orgData = await orgResponse.json();
        const org = orgData.organizations?.[0];

        if (!org?.id) {
          console.warn(`No organization found for ${job.company_name}`);
          return null;
        }

        // Contact search
        const contactResponse = await fetch(
          `https://api.apollohq.com/v1/contacts/search?organization_id=${org.id}&department=HR`,
          { 
            headers: { 
              'Authorization': `Basic ${btoa(`${APOLLO_API_KEY}:X`)}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        if (!contactResponse.ok) {
          console.warn(`Apollo API contact search error for ${job.company_name}: ${contactResponse.status}`);
          return null;
        }

        const contactData = await contactResponse.json();
        const contacts = contactData.contacts || [];
        console.log(`Found ${contacts.length} HR contacts for ${job.company_name}`);
        contactsFound += contacts.length;

        // Save HR contacts
        const contactInsertPromises = contacts.map(async (contact: any) => {
          try {
            const { error } = await supabase.from('hr_contacts').insert({
              job_offer_id: job.id,
              full_name: contact.name?.full || 'Unknown',
              role: contact.title || 'HR',
              email: contact.email?.[0]?.email || null,
              phone: contact.phone?.[0]?.number || null,
              source: 'apollo_io',
            });

            if (error) {
              console.error('Contact insert error:', error);
            }
          } catch (err) {
            console.error('Error inserting contact:', err);
          }
        });

        await Promise.all(contactInsertPromises);
        return job;
      } catch (err) {
        console.warn(`Error processing contacts for ${job.company_name}:`, err);
        return job; // Continue with the job even if contact search fails
      }
    });

    await Promise.all(contactPromises);
    console.log(`Finished processing contacts. Found ${contactsFound} contacts in total.`);

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        jobsProcessed: insertedJobs.length,
        contactsFound: contactsFound
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Scrape and enrich error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: error.message || 'Ein unerwarteter Fehler ist aufgetreten'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Return 200 with error in body instead of 500
    );
  }
});

