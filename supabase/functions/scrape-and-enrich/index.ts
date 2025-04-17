
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables (to be configured in Supabase secrets)
const APOLLO_API_KEY = Deno.env.get("APOLLO_API_KEY") || "";

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
        'X-API-Key': APOLLO_API_KEY // Direct API key method
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
      
      // Step 2: Search for companies using the Apollo Organizations API
      console.log("Searching for companies using Apollo Organizations API...");
      const apolloOrgResponse = await fetch(
        `https://api.apollo.io/v1/organizations/search`,
        { 
          method: 'POST', 
          headers: headers,
          body: JSON.stringify({ 
            q_organization_name: "Software",
            page: 1,
            per_page: 10
          }) 
        }
      );

      if (!apolloOrgResponse.ok) {
        const responseText = await apolloOrgResponse.text();
        console.error(`Apollo API organization search error: ${apolloOrgResponse.status}`);
        console.error(`Apollo API error details: ${responseText}`);
        
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: `Apollo API Fehler: ${apolloOrgResponse.status}`,
            errorDetails: responseText
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // Parse the organizations data
      const orgsData = await apolloOrgResponse.json();
      console.log(`Retrieved ${orgsData.organizations?.length || 0} organizations from Apollo`);
      
      if (!orgsData.organizations || orgsData.organizations.length === 0) {
        return new Response(
          JSON.stringify({ 
            status: 'error', 
            message: 'Keine Organisationen gefunden. Bitte versuchen Sie es später noch einmal.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      // Step 3: Create job data from the organizations
      const jobsData = orgsData.organizations.map((organization, index) => {
        console.log(`Processing organization: ${organization.name}`);
        
        return {
          title: `${organization.industry || 'Tech'} Professional ${index + 1}`,
          company: organization.name || 'Unknown Company',
          location: organization.city ? `${organization.city}, ${organization.state || organization.country || 'Unknown'}` : 'Berlin, Germany',
          description: `Join ${organization.name} as a ${organization.industry || 'Tech'} Professional! ${organization.short_description || ''}`,
          postedAt: new Date().toISOString(),
          source: 'apollo_io',
          companyDomain: organization.domain || null,
        };
      });

      // Step 4: Save the job offers to the database
      console.log("Saving job offers to database...");
      const jobInsertPromises = jobsData.map(async (job) => {
        try {
          const { data, error } = await supabase.from('job_offers').insert({
            title: job.title || 'Unknown Title',
            company_name: job.company || 'Unknown Company',
            location: job.location || 'Unknown Location',
            description: job.description || '',
            posted_at: job.postedAt ? new Date(job.postedAt).toISOString() : null,
            source: job.source,
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

      // Step 5: Find HR contacts via Apollo People Search
      console.log("Starting HR contact search for companies...");
      let contactsFound = 0;
      
      const contactPromises = insertedJobs.map(async (job) => {
        if (!job) return null;

        try {
          console.log(`Searching HR contacts for company: ${job.company_name}`);
          
          // Search for HR contacts with more specific criteria
          const contactResponse = await fetch(
            `https://api.apollo.io/v1/people/search`,
            { 
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                q_organization_name: job.company_name,
                page: 1,
                per_page: 5,
                person_titles: ["HR", "Human Resources", "Recruiting", "Talent", "People", "Hiring"],
                contact_email_status: ["verified"]
              })
            }
          );

          if (!contactResponse.ok) {
            console.warn(`Apollo API contact search error for ${job.company_name}: ${contactResponse.status}`);
            const errorText = await contactResponse.text();
            console.warn(`Error details: ${errorText}`);
            return null;
          }

          const contactData = await contactResponse.json();
          const contacts = contactData.people || [];
          
          console.log(`Found ${contacts.length} verified HR contacts for ${job.company_name}`);
          contactsFound += contacts.length;
          
          contacts.forEach((contact) => {
            console.log(`Contact found: ${contact.name}, ${contact.title}, Email: ${contact.email || 'No email'}`);
          });

          // Save HR contacts with more detailed information
          const contactInsertPromises = contacts.map(async (contact) => {
            try {
              const { error } = await supabase.from('hr_contacts').insert({
                job_offer_id: job.id,
                full_name: contact.name || 'Unknown',
                role: contact.title || 'HR',
                email: contact.email || null,
                phone: contact.phone_number || null,
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
          return job;
        }
      });

      await Promise.all(contactPromises);
      console.log(`Finished processing contacts. Found ${contactsFound} contacts in total.`);

      return new Response(
        JSON.stringify({ 
          status: 'success', 
          jobsProcessed: insertedJobs.length,
          contactsFound: contactsFound,
          message: `${insertedJobs.length} Jobs und ${contactsFound} HR-Kontakte wurden synchronisiert`
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
