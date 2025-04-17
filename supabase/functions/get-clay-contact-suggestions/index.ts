
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API configuration
const CLAY_API_TOKEN = Deno.env.get("CLAY_API_TOKEN") || "";
const CLAY_API_URL = "https://api.clay.com/v1/workbooks";

// Supabase client initialization for logging purposes
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  console.log("Clay contact suggestions function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request body for search parameters
    const requestBody = await req.json().catch((error) => {
      console.error("Failed to parse request body:", error);
      return {};
    });

    console.log("Request body:", JSON.stringify(requestBody));
    
    const {
      userId,
      companyId,
      title,
      location,
      experience,
      industry
    } = requestBody;

    // Input validation
    if (!title) {
      console.error("Missing required parameter: title");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required parameter: title (search query)",
          suggestions: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Processing request for user ${userId}, company ${companyId}, search: ${title}`);

    // Initialize Supabase client for logging
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let workbookId = "";
    let workbookUrl = "";
    const suggestions = [];

    // Log the function call
    try {
      const { error: logError } = await supabase
        .from("function_logs")
        .insert({
          function_name: "get-clay-contact-suggestions",
          user_id: userId,
          company_id: companyId,
          request_payload: { title, location, experience, industry },
          status: "processing"
        });

      if (logError) {
        console.warn("Error logging function call:", logError);
      }
    } catch (logErr) {
      console.warn("Failed to log function call:", logErr);
    }

    // Check if Clay API token is configured
    if (!CLAY_API_TOKEN) {
      console.error("CLAY_API_TOKEN is not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Clay API is not properly configured",
          suggestions: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Try to create a Clay workbook
    try {
      console.log("Creating Clay workbook for:", title);
      
      const clayResponse = await fetch(CLAY_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CLAY_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: `Job Search: ${title}`,
          description: `Contact suggestions for "${title}" ${location ? `in ${location}` : ""}`,
          tableData: {
            columns: [
              { name: "Name", type: "text" },
              { name: "Company", type: "text" },
              { name: "Title", type: "text" },
              { name: "Email", type: "email" },
              { name: "LinkedIn", type: "link" },
              { name: "Source", type: "text" }
            ],
            rows: []
          },
          metadata: {
            searchQuery: title,
            searchLocation: location || "",
            searchExperience: experience || "",
            searchIndustry: industry || "",
            createdBy: userId,
            companyId: companyId
          }
        })
      });

      if (!clayResponse.ok) {
        const errorData = await clayResponse.text();
        console.error("Clay API error:", clayResponse.status, errorData);
        throw new Error(`Clay API error: ${clayResponse.status} ${errorData}`);
      }

      const clayData = await clayResponse.json();
      console.log("Clay workbook created successfully:", clayData.id);
      
      workbookId = clayData.id;
      workbookUrl = `https://app.clay.com/workbooks/${workbookId}`;
      
      // Generate 3 mock contact suggestions for demonstration
      // In a real implementation, these would come from Clay's API
      for (let i = 0; i < 3; i++) {
        suggestions.push({
          hr_contact: {
            name: `HR Manager ${i+1}`,
            position: "Human Resources Director",
            email: `hr${i+1}@example.com`,
            phone: `+49123456789${i}`,
            linkedin: `https://linkedin.com/in/hr-manager-${i+1}`
          },
          company: {
            name: `Company ${String.fromCharCode(65 + i)}`,
            website: `https://company${String.fromCharCode(97 + i)}.com`,
            linkedin: `https://linkedin.com/company/company-${String.fromCharCode(97 + i)}`
          },
          job: {
            title: title
          },
          email_template: `Subject: Application for ${title} position\n\nDear HR Manager,\n\nI'm writing to express my interest in the ${title} position at your company.\n\nBest regards,\n[Your Name]`,
          metadata: {
            source: "Clay AI",
            confidence_score: 0.8 - (i * 0.1),
            generated_at: new Date().toISOString(),
            enrichment_id: `enr_${Math.random().toString(36).substring(2, 10)}`
          }
        });
      }

      // Log successful creation
      try {
        await supabase
          .from("function_logs")
          .update({
            status: "success",
            response_payload: { workbookId, workbookUrl },
            completed_at: new Date().toISOString()
          })
          .eq("function_name", "get-clay-contact-suggestions")
          .eq("user_id", userId)
          .is("completed_at", null);
      } catch (logErr) {
        console.warn("Failed to update log entry:", logErr);
      }

      // Store the workbook URL in the database
      try {
        await supabase
          .from("clay_workbooks")
          .insert({
            user_id: userId,
            company_id: companyId,
            query_payload: { title, location, experience, industry },
            workbook_url: workbookUrl,
            workbook_id: workbookId,
            status: "ready"
          });
      } catch (dbErr) {
        console.warn("Failed to store workbook data:", dbErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          workbookId,
          workbookUrl,
          suggestions
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      console.error("Error creating Clay workbook:", error);
      
      // Log the error
      try {
        await supabase
          .from("function_logs")
          .update({
            status: "error",
            error_message: error.message || "Unknown error creating Clay workbook",
            completed_at: new Date().toISOString()
          })
          .eq("function_name", "get-clay-contact-suggestions")
          .eq("user_id", userId)
          .is("completed_at", null);
      } catch (logErr) {
        console.warn("Failed to update log entry:", logErr);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || "Failed to create Clay workbook",
          suggestions: []
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Unexpected error in get-clay-contact-suggestions:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
        suggestions: []
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
