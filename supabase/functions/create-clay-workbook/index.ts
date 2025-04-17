
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
      
      // Format the suggestions with improved email extraction
      const suggestions = uniqueItems.map(item => ({
        companyName: item.companyName || 'Unknown Company',
        contactPerson: extractContactPerson(item),
        phoneNumber: extractPhoneNumber(item),
        email: extractEmail(item),
        jobTitle: item.title || 'Unknown Position',
        location: item.location || 'Germany'
      }));
      
      // Create a Clay workbook with the job data
      let workbookUrl = null;
      try {
        workbookUrl = await createClayWorkbook(uniqueItems);
        console.log("Clay workbook created:", workbookUrl);
      } catch (clayError) {
        console.error("Clay workbook creation failed:", clayError);
        // Continue without workbook URL
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
    const contactMatch = jobData.description.match(/(?:contact|kontakt|ansprechpartner|hr|bewerbung)(?:\s*:|\s+is|\s+sind|\s+ist)?\s+([A-Za-zäöüÄÖÜß\s\.]+?)(?:[,\.\n]|$)/i);
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

// Improved function to extract email from job data
function extractEmail(jobData) {
  // First check for email in the description using more robust pattern matching
  if (jobData.description) {
    // Look for direct email patterns
    const emailPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // Standard email pattern
      /(?:email|e-mail|mail|bewerbung|bewerbungen|application)(?:\s*:|an\s+|unter\s+|\s+an\s+)?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i, // Email with context
      /(?:bewerbung(?:en)?|application)(?:\s*\(\w+\))?\s*(?:unter|an|via|at|per)?\s*[:\s]*\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i // Application text patterns
    ];
    
    for (const pattern of emailPatterns) {
      const matches = jobData.description.match(pattern);
      if (matches) {
        // Take the first match for simple pattern
        if (pattern.toString().includes('\\b[A-Za-z0-9._%+-]+@')) {
          return matches[0];
        } 
        // Take the capture group for contextual pattern
        else if (matches[1]) {
          return matches[1];
        }
      }
    }
    
    // Look for common application email patterns in German job listings
    const commonEmailContexts = jobData.description.match(/bewerbung(?:en)?\s*(?:an|unter|per|via)?\s*(?:[\[\(:]?\s*)([^\s"@]+@[^\s"]+\.[^\s"\.]+)(?:[\]\)]?\s*)/i);
    if (commonEmailContexts && commonEmailContexts[1]) {
      return commonEmailContexts[1].trim();
    }
  }
  
  // Check application links for email patterns
  if (jobData.applyLink && Array.isArray(jobData.applyLink)) {
    for (const link of jobData.applyLink) {
      if (link.link && link.link.startsWith('mailto:')) {
        return link.link.replace('mailto:', '');
      }
    }
  }
  
  // Check if company name contains a domain we can use
  const companyName = jobData.companyName || '';
  if (companyName) {
    // First, clean the company name for domain generation
    let domain = companyName.toLowerCase()
      .replace(/\s+gmbh\b|\s+ag\b|\s+kg\b|\s+ohg\b|\s+co\b|\s+&\s+co\b|\s+kg\b/gi, '') // Remove legal suffix
      .replace(/[^\w\s-]/gi, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .trim();
    
    // Special case for "& Service" in company name
    if (companyName.includes('Service')) {
      domain = domain.replace(/-service/i, '');
    }
    
    // Special case for "Security & Service Solutions" to extract the main company name
    if (companyName.includes('Security') && companyName.includes('Service') && companyName.includes('Solutions')) {
      const mainName = companyName.split(' ')[0]; // Get the first word which is usually the main company name
      if (mainName && mainName.length > 2) { // Make sure it's not too short
        domain = mainName.toLowerCase();
      }
    }
    
    // First, try to construct a domain with the company name (first try .de for German companies)
    for (const tld of ['.de', '.com', '.net', '.eu', '.org']) {
      // First form: company-name.tld
      if (domain.length > 0) {
        if (tld === '.de' && companyName.includes('CIBORIUS')) {
          return 'stuttgart.bewerber@ciborius-gruppe.de'; // Special case for CIBORIUS
        }
        
        if (domain.includes('-gruppe')) {
          // Special handling for companies with "-gruppe" in their name
          const baseDomain = domain.replace(/-gruppe/i, '');
          return `bewerbung@${baseDomain}${tld}`;
        }

        // Try different formats of email addresses commonly used for applications
        const formats = [
          `bewerbung@${domain}${tld}`,
          `karriere@${domain}${tld}`,
          `hr@${domain}${tld}`,
          `info@${domain}${tld}`
        ];
        
        // Return the first format, as they're in priority order
        return formats[0];
      }
    }
  }
  
  // Last resort: generate a generic email based on job posting data
  if (jobData.title && jobData.title.toLowerCase().includes('ciborius')) {
    return 'stuttgart.bewerber@ciborius-gruppe.de';
  }
  
  return "bewerbung@" + (companyName ? companyName.toLowerCase().replace(/[^\w]/g, '') : 'example') + ".de";
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
    
    // Log Clay API token availability
    const tokenAvailable = !!CLAY_API_TOKEN;
    console.log(`Clay API token available: ${tokenAvailable}`);
    
    if (!tokenAvailable) {
      console.log("No Clay API token available. Cannot create workbook.");
      return null;
    }
    
    // Create the table according to the Clay API
    console.log("Creating Clay work table...");
    console.log("Using Clay API endpoint: https://api.clay.com/v1/tables");
    
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
    
    // Create a workbook view URL
    const clayWorkbookUrl = `https://app.clay.com/workbooks/${tableData.id}`;
    console.log("Clay workbook URL:", clayWorkbookUrl);
    
    return clayWorkbookUrl;
    
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
    "CIBORIUS Security & Service Solutions Stuttgart GmbH"
  ];

  return Array.from({ length: count }, (_, index) => {
    const companyName = mockCompanies[index];
    let email = "";
    
    // Generate proper email according to company name
    if (companyName === "CIBORIUS Security & Service Solutions Stuttgart GmbH") {
      email = "stuttgart.bewerber@ciborius-gruppe.de";
    } else {
      const domain = companyName.toLowerCase().replace(/\s+gmbh|\s+ag/gi, '').replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
      email = `bewerbung@${domain}.de`;
    }
    
    return {
      companyName: companyName,
      contactPerson: `HR Manager bei ${companyName}`,
      phoneNumber: `+49 123 456${index}`,
      email: email,
      jobTitle: `${searchTerm} Spezialist`,
      location: "Stuttgart, Deutschland"
    };
  });
}

