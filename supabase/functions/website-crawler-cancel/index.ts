
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
    
    // Update job status in database
    const { error: updateError } = await supabaseAdmin
      .from('ai_training_jobs')
      .update({
        status: 'failed',
        error: 'Job cancelled by user',
        updatedat: new Date().toISOString()
      })
      .eq('jobid', jobId);
      
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
    
    // In a more sophisticated system, we might need to signal a job runner to stop
    // or remove the job from a queue. This simple implementation just updates the status.
    
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
