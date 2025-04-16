
// Import required dependencies
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors-headers.ts";
import { supabase } from "../_shared/supabase-client.ts";

// Handler function to generate contact suggestions
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchId } = await req.json();
    
    if (!searchId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: searchId" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Fetch the search results
    const { data: searchData, error: searchError } = await supabase
      .from("job_search_history")
      .select("search_results, company_id, search_query, search_location")
      .eq("id", searchId)
      .single();
      
    if (searchError) {
      console.error("Error fetching search results:", searchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch search results" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Mock AI generation for now
    const aiSuggestion = {
      hr_name: "Sarah Johnson",
      hr_position: "HR Manager",
      hr_email: "sarah.johnson@" + searchData.search_results[0]?.company_name.toLowerCase().replace(/\s+/g, "") + ".com",
      hr_phone: "+49 123 4567890",
      confidence: 0.85,
      company_name: searchData.search_results[0]?.company_name,
      job_title: searchData.search_results[0]?.title,
    };
    
    // Update the job search record with the AI suggestion
    const { error: updateError } = await supabase
      .from("job_search_history")
      .update({ ai_contact_suggestion: aiSuggestion })
      .eq("id", searchId);
      
    if (updateError) {
      console.error("Error updating search record with AI suggestion:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save AI suggestion" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, suggestion: aiSuggestion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error in generate-contact-suggestion:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
