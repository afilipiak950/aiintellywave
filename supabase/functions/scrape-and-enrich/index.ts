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
    console.log("Apollo API Key length:", APOLLO_API_KEY.length);
    // For debugging purposes, log the first and last two characters of the key
    if (APOLLO_API_KEY && APOLLO_API_KEY.length > 4) {
      console.log("API Key starts with:", APOLLO_API_KEY.substring(0, 2) + "...");
      console.log("API Key ends with:", "..." + APOLLO_API_KEY.substring(APOLLO_API_KEY.length - 2));
    }
    
    // Check if Apollo API key is available
    if (!APOLLO_API_KEY) {
      console.error("APOLLO_API_KEY is not configured");
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Apollo API-Schlüssel ist nicht konfiguriert',
          errorDetails: 'No API key found in environment variables'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    try {
      // Build proper headers for Apollo API
      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      };
      
      // Add API key using the correct authentication method for Apollo
      // Try using the direct API key header method first
      headers['X-API-Key'] = APOLLO_API_KEY;
      
      console.log("Using Apollo API with direct API key header");
      
      // Apollo Organization Search API call
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

      // Get response text for detailed error logging
      const responseText = await apolloOrgResponse.text();
      
      // Detailed logging for debugging
      console.log("Apollo API Response Status:", apolloOrgResponse.status);
      console.log("Apollo API Response Body (first 100 chars):", responseText.substring(0, 100));

      // If the first method failed with 401, try the Basic Auth method
      if (apolloOrgResponse.status === 401) {
        console.log("Direct API key failed, trying with Basic Auth method");
        
        // Use the Basic Auth method as an alternative
        const basicAuth = btoa(`${APOLLO_API_KEY}:`);
        headers['Authorization'] = `Basic ${basicAuth}`;
        delete headers['X-API-Key']; // Remove the direct key header
        
        const retryResponse = await fetch(
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
        
        const retryText = await retryResponse.text();
        console.log("Retry with Basic Auth - Status:", retryResponse.status);
        console.log("Retry with Basic Auth - Body (first 100 chars):", retryText.substring(0, 100));
        
        if (!retryResponse.ok) {
          console.error(`Apollo API error with both methods: ${retryResponse.status}`);
          return new Response(
            JSON.stringify({ 
              status: 'error', 
              message: `Apollo API Fehler: Der API-Schlüssel ist ungültig. Bitte überprüfen Sie das Format des Schlüssels.`,
              errorDetails: retryText
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        // If the retry was successful, use this response
        const orgsData = JSON.parse(retryText);
        console.log(`Retrieved ${orgsData.organizations?.length} organizations from Apollo using Basic Auth`);
        
        // Use this data for the rest of the function
        // ... keep existing code for the rest of the function (processing organizations, etc)
        
        // Initialize Supabase client
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("Supabase credentials not configured");
          throw new Error("Supabase configuration is missing");
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Create mock job data from organizations
        const jobsData = orgsData.organizations?.map((org: any, index: number) => ({
          title: `Software Engineer ${index + 1}`,
          company: org.name || 'Unknown Company',
          location: org.city ? `${org.city}, ${org.state || org.country || 'Unknown'}` : 'Berlin, Germany',
          description: `Join ${org.name} as a Software Engineer! ${org.short_description || ''}`,
          postedAt: new Date().toISOString(),
          source: 'apollo_io'
        })) || [];

        // Step B: Save Job Offers
        const jobInsertPromises = jobsData.map(async (job: any) => {
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

        // Step C: Find HR Contacts via Apollo People Search
        console.log("Starting HR contact search with Apollo...");
        let contactsFound = 0;
        
        const contactPromises = insertedJobs.map(async (job) => {
          if (!job) return null;

          try {
            // Search for HR contacts at the company
            const contactResponse = await fetch(
              `https://api.apollo.io/v1/people/search`,
              { 
                method: 'POST',
                headers: headers, // Use the same successful headers
                body: JSON.stringify({
                  q_organization_name: job.company_name,
                  page: 1,
                  per_page: 5,
                  person_titles: ["HR", "Human Resources", "Recruiting", "Talent"]
                })
              }
            );

            if (!contactResponse.ok) {
              console.warn(`Apollo API contact search error for ${job.company_name}: ${contactResponse.status}`);
              return null;
            }

            const contactData = await contactResponse.json();
            const contacts = contactData.people || [];
            console.log(`Found ${contacts.length} HR contacts for ${job.company_name}`);
            contactsFound += contacts.length;

            // Save HR contacts
            const contactInsertPromises = contacts.map(async (contact: any) => {
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
            return job; // Continue with the job even if contact search fails
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
      } else if (!apolloOrgResponse.ok) {
        console.error(`Apollo API error: ${apolloOrgResponse.status}`);
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

      // Original request was successful
      const orgsData = JSON.parse(responseText);
      console.log(`Retrieved ${orgsData.organizations?.length} organizations from Apollo with direct API key`);
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase credentials not configured");
        throw new Error("Supabase configuration is missing");
      }
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Create mock job data from organizations
      const jobsData = orgsData.organizations?.map((org: any, index: number) => ({
        title: `Software Engineer ${index + 1}`,
        company: org.name || 'Unknown Company',
        location: org.city ? `${org.city}, ${org.state || org.country || 'Unknown'}` : 'Berlin, Germany',
        description: `Join ${org.name} as a Software Engineer! ${org.short_description || ''}`,
        postedAt: new Date().toISOString(),
        source: 'apollo_io'
      })) || [];

      // Step B: Save Job Offers
      const jobInsertPromises = jobsData.map(async (job: any) => {
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

      // Step C: Find HR Contacts via Apollo People Search
      console.log("Starting HR contact search with Apollo...");
      let contactsFound = 0;
      
      const contactPromises = insertedJobs.map(async (job) => {
        if (!job) return null;

        try {
          // Search for HR contacts at the company using the same successful headers from earlier
          const contactResponse = await fetch(
            `https://api.apollo.io/v1/people/search`,
            { 
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                q_organization_name: job.company_name,
                page: 1,
                per_page: 5,
                person_titles: ["HR", "Human Resources", "Recruiting", "Talent"]
              })
            }
          );

          if (!contactResponse.ok) {
            console.warn(`Apollo API contact search error for ${job.company_name}: ${contactResponse.status}`);
            return null;
          }

          const contactData = await contactResponse.json();
          const contacts = contactData.people || [];
          console.log(`Found ${contacts.length} HR contacts for ${job.company_name}`);
          contactsFound += contacts.length;

          // Save HR contacts
          const contactInsertPromises = contacts.map(async (contact: any) => {
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
          return job; // Continue with the job even if contact search fails
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
