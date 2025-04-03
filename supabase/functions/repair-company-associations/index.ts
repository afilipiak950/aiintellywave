
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting repair of company associations...");
    
    // First, let's ensure we have at least one company to work with
    const { data: companies, error: companiesError } = await supabaseClient
      .from('companies')
      .select('id, name')
      .limit(1);
    
    if (companiesError) {
      console.error("Error checking companies:", companiesError);
      throw companiesError;
    }
    
    // If no companies exist, create a default one
    if (!companies || companies.length === 0) {
      console.log("No companies found, creating a default company");
      const { data: newCompany, error: createError } = await supabaseClient
        .from('companies')
        .insert({
          name: 'Default Company',
          description: 'System-generated default company'
        })
        .select();
        
      if (createError) {
        console.error("Error creating default company:", createError);
        throw createError;
      }
      
      console.log("Created default company:", newCompany);
    }
    
    // Now call the repair function
    const { data, error } = await supabaseClient.rpc('repair_user_company_associations');
    
    if (error) {
      console.error("Error repairing company associations:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 500 
        }
      );
    }
    
    // After repair, recheck the company associations
    const { data: checkData, error: checkError } = await supabaseClient
      .from('company_users')
      .select(`
        user_id,
        company_id,
        companies (
          id,
          name
        )
      `)
      .limit(100);
    
    if (checkError) {
      console.error("Error checking company users after repair:", checkError);
    } else {
      console.log(`Found ${checkData?.length || 0} company-user associations after repair`);
    }
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
