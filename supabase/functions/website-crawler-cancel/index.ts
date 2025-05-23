
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// This function attempts to cancel an ongoing job
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { jobId } = await req.json();
    
    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing jobId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Attempting to cancel job: ${jobId}`);
    
    // Create Supabase client with service role key (to access RLS-protected tables)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Update search string status in database
    const { data, error: updateError } = await supabaseAdmin
      .from('search_strings')
      .update({
        status: 'failed',
        progress: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select();
      
    if (updateError) {
      console.error(`Error updating job ${jobId} status:`, updateError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to update job status: ${updateError.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        jobId,
        message: "Job cancelled successfully"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error cancelling job:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
