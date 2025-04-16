
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";
import { supabase } from "../_shared/supabase-client.ts";

// Clay API configuration
const CLAY_API_TOKEN = Deno.env.get('CLAY_API_TOKEN');
// Use the Jobs - Fact Talents template ID
const CLAY_TEMPLATE_ID = Deno.env.get('CLAY_TEMPLATE_ID') || "tpl_jobs_fact_talents";

// Handler function to generate contact suggestions
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchId, jobs, query } = await req.json();
    
    if (!searchId || !jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields: searchId or jobs array", 
          message: "Bitte stellen Sie sicher, dass eine gültige Suche durchgeführt wurde."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Processing contact suggestion for search ID: ${searchId}`);
    console.log(`Number of job listings to analyze: ${jobs.length}`);
    
    // Get the jobs data ready for Clay
    const jobsData = jobs.map(job => ({
      company_name: job.company,
      job_title: job.title,
      job_location: job.location || 'Remote',
      job_description: job.description,
      job_url: job.url,
      job_date_posted: job.datePosted || new Date().toISOString()
    }));
    
    if (!CLAY_API_TOKEN) {
      console.error("Clay API token missing. Check environment variables.");
      // Return a fallback suggestion instead of error
      const fallbackSuggestion = createFallbackSuggestion(jobs[0].company, jobs[0].title);
      
      // Try to update the search record with the fallback suggestion if it's not a temporary search
      if (searchId !== 'temporary-search') {
        try {
          const { error: updateError } = await supabase
            .from("job_search_history")
            .update({ ai_contact_suggestion: fallbackSuggestion })
            .eq("id", searchId);
            
          if (updateError) {
            console.error("Error updating search record with fallback suggestion:", updateError);
          }
        } catch (err) {
          console.error("Error updating search with fallback:", err);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    try {
      // Step 1: Create a new Clay work table for this job search
      const clayWorkTable = await createClayWorkTable(jobsData);
      
      if (!clayWorkTable || !clayWorkTable.success) {
        console.error("Failed to create Clay work table:", clayWorkTable?.error || "Unknown error");
        const fallbackSuggestion = createFallbackSuggestion(jobs[0].company, jobs[0].title);
        return new Response(
          JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Created Clay work table with ID:", clayWorkTable.tableId);
      
      // Step 2: Run the Jobs - Fact Talents enrichment on the work table
      const enrichmentResult = await runClayEnrichment(clayWorkTable.tableId);
      
      if (!enrichmentResult || !enrichmentResult.success) {
        console.error("Failed to run Clay enrichment:", enrichmentResult?.error || "Unknown error");
        const fallbackSuggestion = createFallbackSuggestion(jobs[0].company, jobs[0].title);
        return new Response(
          JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Enrichment process initiated with ID:", enrichmentResult.enrichmentId);
      
      // Step 3: Wait for the enrichment to complete and get the results
      const enrichedData = await waitForEnrichmentResults(enrichmentResult.enrichmentId);
      
      if (!enrichedData || !enrichedData.success) {
        console.error("Failed to get enrichment results:", enrichedData?.error || "Unknown error");
        const fallbackSuggestion = createFallbackSuggestion(jobs[0].company, jobs[0].title);
        return new Response(
          JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Successfully retrieved enriched data");
      
      // Step 4: Format the enriched data for the response
      const contactSuggestion = formatContactSuggestion(enrichedData.data, jobs[0].company, jobs[0].title);
      
      // Update the job search record with the contact suggestion
      if (searchId !== 'temporary-search') {
        try {
          const { error: updateError } = await supabase
            .from("job_search_history")
            .update({ ai_contact_suggestion: contactSuggestion })
            .eq("id", searchId);
            
          if (updateError) {
            console.error("Error updating search record with contact suggestion:", updateError);
          }
        } catch (err) {
          console.error("Error updating search with contact suggestion:", err);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, suggestion: contactSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (callError) {
      console.error("Error during Clay API call:", callError);
      // Return a fallback suggestion if there's an error
      const fallbackSuggestion = createFallbackSuggestion(jobs[0].company, jobs[0].title);
      
      return new Response(
        JSON.stringify({ success: true, suggestion: fallbackSuggestion }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error in generate-contact-suggestion:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut."
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Function to create a new work table in Clay with job data
async function createClayWorkTable(jobsData: any[]) {
  try {
    console.log(`Creating Clay work table with ${jobsData.length} jobs`);
    
    // Create a work table name with timestamp for uniqueness
    const workTableName = `Job Search ${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    
    const response = await fetch('https://api.clay.com/v1/tables', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: workTableName,
        description: "Job search for contact enrichment",
        rows: jobsData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Clay API error creating table (${response.status}):`, errorData);
      return { success: false, error: `API returned status ${response.status}` };
    }
    
    const data = await response.json();
    console.log("Clay API table creation response:", JSON.stringify(data).substring(0, 200) + "...");
    
    return { success: true, tableId: data.id };
  } catch (error) {
    console.error("Error creating Clay work table:", error);
    return { success: false, error: error.message };
  }
}

// Function to run the Jobs - Fact Talents enrichment on a work table
async function runClayEnrichment(tableId: string) {
  try {
    console.log(`Running Jobs - Fact Talents enrichment on table: ${tableId}`);
    
    const response = await fetch(`https://api.clay.com/v1/tables/${tableId}/enrich`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: CLAY_TEMPLATE_ID, // This should be the Jobs - Fact Talents template
        column_mappings: {
          "company_name": "company_name",
          "job_title": "job_title",
          "job_location": "job_location",
          "job_description": "job_description",
          "job_url": "job_url"
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Clay API error running enrichment (${response.status}):`, errorData);
      return { success: false, error: `API returned status ${response.status}` };
    }
    
    const data = await response.json();
    console.log("Clay API enrichment response:", JSON.stringify(data).substring(0, 200) + "...");
    
    return { success: true, enrichmentId: data.id };
  } catch (error) {
    console.error("Error running Clay enrichment:", error);
    return { success: false, error: error.message };
  }
}

// Function to wait for enrichment to complete and get results
async function waitForEnrichmentResults(enrichmentId: string, maxWaitTime: number = 30000, pollInterval: number = 2000) {
  try {
    console.log(`Waiting for enrichment ${enrichmentId} to complete...`);
    
    const startTime = Date.now();
    let enrichmentComplete = false;
    let enrichedData = null;
    
    while (!enrichmentComplete && (Date.now() - startTime) < maxWaitTime) {
      // Check enrichment status
      const response = await fetch(`https://api.clay.com/v1/enrichments/${enrichmentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CLAY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Error checking enrichment status (${response.status})`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }
      
      const statusData = await response.json();
      
      // Check if enrichment is complete
      if (statusData.status === 'completed') {
        console.log("Enrichment completed, fetching results");
        enrichmentComplete = true;
        
        // Get the enriched data
        const dataResponse = await fetch(`https://api.clay.com/v1/enrichments/${enrichmentId}/results`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CLAY_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!dataResponse.ok) {
          const errorData = await dataResponse.text();
          console.error(`Error fetching enrichment results (${dataResponse.status}):`, errorData);
          return { success: false, error: `API returned status ${dataResponse.status}` };
        }
        
        enrichedData = await dataResponse.json();
        break;
      } else if (statusData.status === 'failed') {
        console.error("Enrichment failed:", statusData.error || "Unknown error");
        return { success: false, error: statusData.error || "Enrichment failed" };
      } else {
        console.log(`Enrichment in progress, status: ${statusData.status}`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    if (!enrichmentComplete) {
      console.error("Enrichment timed out");
      return { success: false, error: "Enrichment timed out" };
    }
    
    if (!enrichedData) {
      console.error("No enriched data received");
      return { success: false, error: "No enriched data received" };
    }
    
    console.log("Successfully retrieved enriched data");
    return { success: true, data: enrichedData };
  } catch (error) {
    console.error("Error waiting for enrichment results:", error);
    return { success: false, error: error.message };
  }
}

// Function to format contact data into a structured suggestion
function formatContactSuggestion(enrichedData: any, companyName: string, jobTitle: string) {
  try {
    // If no valid enriched data is returned, create a fallback suggestion
    if (!enrichedData || !enrichedData.results || enrichedData.results.length === 0) {
      return createFallbackSuggestion(companyName, jobTitle);
    }
    
    // Extract the first result from the enriched data
    const firstResult = enrichedData.results[0];
    
    // Extract HR contact information - look for fields that might contain contact data
    const hrContact = {
      name: firstResult.contact_full_name || firstResult.hr_contact_name || `HR Manager at ${companyName}`,
      position: firstResult.contact_title || firstResult.hr_position || "HR Manager",
      email: firstResult.contact_email || firstResult.hr_email || `hr@${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: firstResult.contact_phone || firstResult.hr_phone || "+49 (Standard nicht verfügbar)",
      linkedin: firstResult.contact_linkedin_url || firstResult.hr_linkedin || null
    };
    
    // Extract company information
    const company = {
      name: companyName,
      website: firstResult.company_website || firstResult.website || null,
      linkedin: firstResult.company_linkedin_url || firstResult.company_linkedin || null
    };
    
    // Create a structured suggestion with the enriched data
    return {
      // Contact information
      hr_contact: hrContact,
      
      // Company information
      company: company,
      
      // Job details
      job: {
        title: jobTitle
      },
      
      // Contact template
      email_template: createEmailTemplate(hrContact.name, companyName, jobTitle),
      
      // Metadata
      metadata: {
        source: "Clay API - Jobs Fact Talents",
        confidence_score: firstResult.confidence_score || 0.85,
        generated_at: new Date().toISOString(),
        enrichment_id: enrichedData.id || null
      }
    };
  } catch (error) {
    console.error("Error formatting contact suggestion:", error);
    return createFallbackSuggestion(companyName, jobTitle);
  }
}

// Create a fallback suggestion when Clay API doesn't return valid data
function createFallbackSuggestion(companyName: string, jobTitle: string) {
  const companyDomain = companyName.toLowerCase().replace(/\s+/g, "");
  
  return {
    hr_contact: {
      name: `HR Manager at ${companyName}`,
      position: "HR Manager",
      email: `hr@${companyDomain}.com`,
      phone: "+49 (nicht verfügbar)",
      linkedin: null
    },
    company: {
      name: companyName,
      website: null,
      linkedin: null
    },
    job: {
      title: jobTitle
    },
    email_template: createEmailTemplate("HR Manager", companyName, jobTitle),
    metadata: {
      source: "Fallback Generator",
      confidence_score: 0.3,
      generated_at: new Date().toISOString()
    }
  };
}

// Create an email template for contacting the HR person
function createEmailTemplate(contactName: string, companyName: string, jobTitle: string) {
  return `Betreff: Bewerbung für die Position "${jobTitle}"

Sehr geehrte(r) ${contactName},

ich habe Ihre Stellenausschreibung für die Position "${jobTitle}" bei ${companyName} gesehen und möchte mich hiermit bewerben.

Meine Fähigkeiten und Erfahrungen passen hervorragend zu den Anforderungen dieser Position, und ich bin überzeugt, dass ich einen wertvollen Beitrag zu Ihrem Team leisten kann.

Im Anhang finden Sie meinen Lebenslauf und ein Anschreiben mit weiteren Details zu meinen Qualifikationen.

Ich freue mich auf die Möglichkeit, meine Bewerbung in einem persönlichen Gespräch zu vertiefen.

Mit freundlichen Grüßen,
[Ihr Name]`;
}
