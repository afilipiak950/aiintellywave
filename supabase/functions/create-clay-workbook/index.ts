
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const CLAY_API_TOKEN = Deno.env.get("CLAY_API_TOKEN");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { user_id, company_id, search_term, location, ...additionalFilters } = await req.json();
    
    console.log(`Creating Clay workbook for user ${user_id}, search: "${search_term}" in "${location}"`);
    
    // Validation
    if (!user_id || !search_term) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          message: "user_id and search_term are required"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    // Check if the Clay API token is available
    if (!CLAY_API_TOKEN) {
      console.error("Clay API token is not configured in secrets");
      return new Response(
        JSON.stringify({ 
          error: "Configuration error", 
          message: "Clay API token is not configured"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Prepare query payload
    const queryPayload = {
      search_term,
      location,
      ...additionalFilters
    };

    // Create a record in clay_workbooks table with status "pending"
    const { data: workbookRecord, error: insertError } = await supabase
      .from("clay_workbooks")
      .insert({
        user_id,
        company_id,
        query_payload: queryPayload,
        workbook_url: "pending", // Temporary value until we get the real URL
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting workbook record:", insertError);
      return new Response(
        JSON.stringify({ 
          error: "Database error", 
          message: "Failed to create workbook record"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }

    // Create a title for the Clay workbook
    const workbookTitle = `Job-Ansprechpartner für ${search_term}${location ? ` in ${location}` : ''}`;
    
    // Create request payload for Clay API
    const clayPayload = {
      title: workbookTitle,
      data: queryPayload
    };

    console.log("Sending request to Clay API:", JSON.stringify(clayPayload));

    // Make API request to Clay
    const clayResponse = await fetch("https://api.clay.run/v1/workbooks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CLAY_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(clayPayload)
    });

    // Parse Clay response
    const clayData = await clayResponse.json();
    
    console.log("Clay API response:", JSON.stringify(clayData));

    if (!clayResponse.ok) {
      console.error("Clay API error:", clayData);
      
      // Update the workbook record with error status
      await supabase
        .from("clay_workbooks")
        .update({
          status: "error",
          error: clayData.message || "Clay API error",
          updated_at: new Date().toISOString()
        })
        .eq("id", workbookRecord.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Clay API error", 
          message: clayData.message || "Failed to create Clay workbook"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 502 
        }
      );
    }

    // Extract workbook URL from Clay response
    const workbookUrl = clayData.url || clayData.workbookUrl;
    
    if (!workbookUrl) {
      console.error("No workbook URL in Clay response:", clayData);
      
      // Update the workbook record with error status
      await supabase
        .from("clay_workbooks")
        .update({
          status: "error",
          error: "No workbook URL in response",
          updated_at: new Date().toISOString()
        })
        .eq("id", workbookRecord.id);
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid response", 
          message: "Clay API did not return a workbook URL"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 502 
        }
      );
    }

    // Update the workbook record with the real URL and set status to "ready"
    const { error: updateError } = await supabase
      .from("clay_workbooks")
      .update({
        workbook_url: workbookUrl,
        status: "ready",
        updated_at: new Date().toISOString()
      })
      .eq("id", workbookRecord.id);

    if (updateError) {
      console.error("Error updating workbook record:", updateError);
      // We'll still return the URL even if the update fails
    }

    // Return success response with workbook URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        workbook_url: workbookUrl,
        id: workbookRecord.id
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Server error", 
        message: error.message || "An unexpected error occurred"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      }
    );
  }
});
