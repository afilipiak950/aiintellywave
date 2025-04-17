
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
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      { 
        method: 'POST', 
        body: JSON.stringify({ 
          query: 'Software Engineer', 
          location: 'Düsseldorf' 
        }) 
      }
    );

    if (!apifyResponse.ok) {
      throw new Error(`Apify API error: ${apifyResponse.status}`);
    }

    const jobsData = await apifyResponse.json();
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Step B: Save Job Offers
    const jobInsertPromises = jobsData.map(async (job: any) => {
      const { data, error } = await supabase.from('job_offers').insert({
        title: job.title,
        company_name: job.company,
        location: job.location,
        description: job.description,
        posted_at: job.postedAt ? new Date(job.postedAt).toISOString() : null,
        source: 'apify_google_jobs',
      }).select();

      if (error) {
        console.error('Job insert error:', error);
        return null;
      }
      return data?.[0];
    });

    const insertedJobs = await Promise.all(jobInsertPromises);

    // Step C: Find HR Contacts via Apollo
    const contactPromises = insertedJobs.map(async (job) => {
      if (!job) return null;

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

      const contactData = await contactResponse.json();
      const contacts = contactData.contacts || [];

      // Save HR contacts
      const contactInsertPromises = contacts.map(async (contact: any) => {
        const { error } = await supabase.from('hr_contacts').insert({
          job_offer_id: job.id,
          full_name: contact.name.full,
          role: contact.title,
          email: contact.email?.[0]?.email,
          phone: contact.phone?.[0]?.number,
          source: 'apollo_io',
        });

        if (error) {
          console.error('Contact insert error:', error);
        }
      });

      await Promise.all(contactInsertPromises);
      return job;
    });

    await Promise.all(contactPromises);

    return new Response(JSON.stringify({ 
      status: 'success', 
      jobsProcessed: insertedJobs.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Scrape and enrich error:', error);
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
