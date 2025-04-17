import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Clay API token from environment variables
const CLAY_API_TOKEN = Deno.env.get('CLAY_API_TOKEN');
// Use the Jobs - Fact Talents template ID
const CLAY_TEMPLATE_ID = Deno.env.get('CLAY_TEMPLATE_ID') || "tpl_jobs_fact_talents";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Create Clay workbook function started");
    
    // Parse request body
    let requestData = {};
    try {
      requestData = await req.json();
      console.log("Request data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      requestData = {}; // Fallback to empty object if parsing fails
    }
    
    const { title, location, experience, industry } = requestData;
    
    // Log the environment variables availability for debugging
    console.log("Environment variables check:");
    console.log("CLAY_API_TOKEN available:", !!CLAY_API_TOKEN);
    console.log("CLAY_TEMPLATE_ID:", CLAY_TEMPLATE_ID);
    
    if (!title) {
      console.error("Missing required field: title/query");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required field: title/query", 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Call Apify to get job data (or use mock data for testing)
    try {
      console.log("Fetching job data...");
      
      // For testing purposes, if no API token is available, return mock data
      if (!CLAY_API_TOKEN) {
        console.log("No Clay API token available. Returning mock data.");
        
        // Generate mock contact suggestions
        const mockSuggestions = generateMockSuggestions(title, 5);
        
        // Return successful response with mock data
        return new Response(
          JSON.stringify({ 
            success: true, 
            suggestions: mockSuggestions,
            workbookUrl: null,
            query: {
              title,
              location,
              experience,
              industry
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Rest of the function remains the same...
      
      // Construct query based on input parameters
      let searchQuery = title;
      if (location) searchQuery += ` ${location}`;
      if (experience) searchQuery += ` ${experience}`;
      if (industry) searchQuery += ` ${industry}`;
      
      const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN') || "apify_api_NOVzYHdbHojPZaa8HlulffsrqBE7Ka1M3y8G";
      
      // Prepare Apify API input
      const apifyInput = {
        queries: [searchQuery],
        countryCode: "de",
        languageCode: "de",
        maxItems: 50, // Limit to 50 items as requested
        includeUnfilteredResults: true,
        csvFriendlyOutput: true,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
          countryCode: "DE"
        },
        endPage: 5
      };
      
      console.log("Apify input:", JSON.stringify(apifyInput));
      
      // Call Apify API
      const apifyResponse = await fetch(`https://api.apify.com/v2/acts/epctex~google-jobs-scraper/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apifyInput)
      });
      
      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text();
        console.error(`Apify API error: ${apifyResponse.status}`, errorText);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Apify API error: ${apifyResponse.status}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Parse Apify response
      const items = await apifyResponse.json();
      console.log(`Received ${items.length} items from Apify`);
      
      // Remove duplicates based on company name
      const uniqueCompanies = new Map();
      items.forEach(item => {
        if (item.companyName && !uniqueCompanies.has(item.companyName)) {
          uniqueCompanies.set(item.companyName, item);
        }
      });
      
      const uniqueItems = Array.from(uniqueCompanies.values());
      console.log(`Filtered to ${uniqueItems.length} unique companies`);
      
      // Format the suggestions
      const suggestions = uniqueItems.map(item => ({
        companyName: item.companyName || 'Unknown Company',
        contactPerson: extractContactPerson(item),
        phoneNumber: extractPhoneNumber(item),
        email: extractEmail(item),
        jobTitle: item.title || 'Unknown Position',
        location: item.location || 'Germany'
      }));
      
      // If we have Clay API token, create a workbook
      let workbookUrl = null;
      if (CLAY_API_TOKEN) {
        try {
          workbookUrl = await createClayWorkbook(uniqueItems);
          console.log("Clay workbook created:", workbookUrl);
        } catch (clayError) {
          console.error("Clay workbook creation failed:", clayError);
          // Continue without workbook URL
        }
      }
      
      // Return successful response
      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions: suggestions,
          workbookUrl: workbookUrl,
          query: {
            title,
            location,
            experience,
            industry
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (apifyError) {
      console.error("Error fetching job data:", apifyError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error fetching job data: ${apifyError.message}`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Unexpected error: ${error.message}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Helper function to extract contact person from job data
function extractContactPerson(jobData) {
  // Try to find contact information in the description
  if (jobData.description) {
    // Look for common patterns that might indicate a contact person
    const contactMatch = jobData.description.match(/(?:contact|kontakt|ansprechpartner|hr)(?:\s*:|\s+is|\s+sind|\s+ist)?\s+([A-Za-zäöüÄÖÜß\s\.]+?)(?:[,\.\n]|$)/i);
    if (contactMatch) {
      return contactMatch[1].trim();
    }
  }
  
  // Default fallback values
  return `HR bei ${jobData.companyName || 'Unknown Company'}`;
}

// Helper function to extract phone number from job data
function extractPhoneNumber(jobData) {
  // Try to find phone number in the description
  if (jobData.description) {
    // Look for common phone number patterns in German format
    const phoneMatch = jobData.description.match(/(?:telefon|tel|phone|fon|ruf)(?:nummer)?(?:\s*:|\s+unter)?\s*([\+\(\)\d\s\/-]{8,}?)(?:[,\.\n]|$)/i);
    if (phoneMatch) {
      return phoneMatch[1].trim();
    }
  }
  
  // Default fallback
  return "Nicht angegeben";
}

// Helper function to extract email from job data
function extractEmail(jobData) {
  // Try to find email in the description
  if (jobData.description) {
    // Look for email pattern
    const emailMatch = jobData.description.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (emailMatch) {
      return emailMatch[0];
    }
  }
  
  // Generate company domain email
  const company = jobData.companyName || '';
  if (company) {
    const domain = company.toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special chars
      .replace(/\s+/g, '') // Remove spaces
      .trim();
    
    if (domain) {
      return `bewerbung@${domain}.de`;
    }
  }
  
  return "Nicht angegeben";
}

// Function to create a Clay workbook with the job data
async function createClayWorkbook(jobsData) {
  try {
    console.log(`Creating Clay workbook with ${jobsData.length} jobs`);
    
    // Create a work table name with timestamp for uniqueness
    const workTableName = `Job Search ${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
    
    // Format data for Clay
    const clayData = jobsData.map(job => ({
      company_name: job.companyName || 'Unknown Company',
      job_title: job.title || 'Job Position',
      job_location: job.location || 'Remote',
      job_description: job.description || '',
      job_url: job.applyLink?.[0]?.link || '',
      job_date_posted: job.metadata?.postedAt || new Date().toISOString(),
    }));
    
    // Create the table according to the Clay API
    console.log("Creating Clay work table...");
    const tableResponse = await fetch('https://api.clay.com/v1/tables', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: workTableName,
        description: "Job search for contact enrichment",
        rows: clayData
      })
    });
    
    if (!tableResponse.ok) {
      const errorText = await tableResponse.text();
      console.error(`Clay API error creating table (${tableResponse.status}):`, errorText);
      throw new Error(`Clay API error: ${tableResponse.status}`);
    }
    
    const tableData = await tableResponse.json();
    console.log("Clay table created with ID:", tableData.id);
    
    // Run enrichment with the Jobs - Fact Talents template
    console.log("Running enrichment with template:", CLAY_TEMPLATE_ID);
    const enrichResponse = await fetch(`https://api.clay.com/v1/tables/${tableData.id}/enrich`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template_id: CLAY_TEMPLATE_ID,
        column_mappings: {
          "company_name": "company_name",
          "job_title": "job_title",
          "job_location": "job_location",
          "job_description": "job_description",
          "job_url": "job_url"
        }
      })
    });
    
    if (!enrichResponse.ok) {
      const errorText = await enrichResponse.text();
      console.error(`Clay API error running enrichment (${enrichResponse.status}):`, errorText);
      throw new Error(`Clay API error: ${enrichResponse.status}`);
    }
    
    const enrichData = await enrichResponse.json();
    console.log("Enrichment initiated with ID:", enrichData.id);
    
    // Create a workbook view URL (this may vary depending on Clay's API)
    return `https://app.clay.com/workbooks/${tableData.id}`;
    
  } catch (error) {
    console.error("Error creating Clay workbook:", error);
    throw error;
  }
}

// Function to generate mock data for testing without API keys
function generateMockSuggestions(searchTerm, count) {
  const mockCompanies = [
    "TechSolutions GmbH", 
    "Digital Innovators AG", 
    "Future Systems", 
    "CodeMasters", 
    "Data Intelligence"
  ];

  return Array.from({ length: count }, (_, index) => ({
    companyName: mockCompanies[index],
    contactPerson: `HR Manager bei ${mockCompanies[index]}`,
    phoneNumber: `+49 123 456${index}`,
    email: `hr@${mockCompanies[index].toLowerCase().replace(/\s+/g, "")}.de`,
    jobTitle: `${searchTerm} Spezialist`,
    location: "Berlin, Deutschland"
  }));
}
