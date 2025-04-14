
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    // Get the user from the request auth context
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'User not authenticated', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing repair for user ${user.id} (${user.email})`);

    // Check if user already has a company association
    const { data: companyUserData, error: companyUserError } = await supabaseClient
      .from('company_users')
      .select('company_id')
      .eq('user_id', user.id);

    if (companyUserError) {
      console.error('Error checking company association:', companyUserError);
      return new Response(
        JSON.stringify({ error: 'Failed to check company association', details: companyUserError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let companyId: string;

    // If no company association exists, create one
    if (!companyUserData || companyUserData.length === 0) {
      console.log('No company association found, creating a new one');

      // Find or create a company
      let { data: companies, error: companiesError } = await supabaseClient
        .from('companies')
        .select('id')
        .limit(1);

      if (companiesError || !companies || companies.length === 0) {
        console.log('No companies found, creating a default company');
        
        // Create default company
        const { data: newCompany, error: createCompanyError } = await supabaseClient
          .from('companies')
          .insert([{
            name: 'Default Company',
            description: 'Automatically created default company'
          }])
          .select('id')
          .single();

        if (createCompanyError) {
          console.error('Error creating company:', createCompanyError);
          return new Response(
            JSON.stringify({ error: 'Failed to create company', details: createCompanyError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        companyId = newCompany.id;
      } else {
        companyId = companies[0].id;
      }

      // Create company_users association
      const { error: createAssociationError } = await supabaseClient
        .from('company_users')
        .insert([{
          user_id: user.id,
          company_id: companyId,
          role: 'customer',
          is_admin: false,
          is_primary_company: true,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        }]);

      if (createAssociationError) {
        console.error('Error creating company association:', createAssociationError);
        return new Response(
          JSON.stringify({ error: 'Failed to create company association', details: createAssociationError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      companyId = companyUserData[0].company_id;
    }

    // Ensure company_features exists and Google Jobs is enabled
    const { data: featuresData, error: featuresError } = await supabaseClient
      .from('company_features')
      .select('id, google_jobs_enabled')
      .eq('company_id', companyId)
      .maybeSingle();

    if (featuresError && featuresError.code !== 'PGRST116') { // PGRST116 is no rows found
      console.error('Error checking company features:', featuresError);
      return new Response(
        JSON.stringify({ error: 'Failed to check company features', details: featuresError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no features record exists or Google Jobs is not enabled, create/update it
    if (!featuresData) {
      console.log('Creating company features with Google Jobs enabled');
      
      // Create features record with Google Jobs enabled
      const { error: createFeaturesError } = await supabaseClient
        .from('company_features')
        .insert([{
          company_id: companyId,
          google_jobs_enabled: true // Enable by default
        }]);

      if (createFeaturesError) {
        console.error('Error creating company features:', createFeaturesError);
        return new Response(
          JSON.stringify({ error: 'Failed to create company features', details: createFeaturesError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (!featuresData.google_jobs_enabled) {
      console.log('Updating company features to enable Google Jobs');
      
      // Update features to enable Google Jobs
      const { error: updateFeaturesError } = await supabaseClient
        .from('company_features')
        .update({
          google_jobs_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', featuresData.id);

      if (updateFeaturesError) {
        console.error('Error updating company features:', updateFeaturesError);
        return new Response(
          JSON.stringify({ error: 'Failed to update company features', details: updateFeaturesError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Repair completed successfully');
    
    return new Response(
      JSON.stringify({ 
        status: 'success', 
        message: 'Company association and features have been repaired',
        company_id: companyId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in repair function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/repair-company-associations' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json'
