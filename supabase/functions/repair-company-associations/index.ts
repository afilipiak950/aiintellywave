
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

// Create a Supabase client with the auth context from the request
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    );

    // Get user data
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          status: 'error', 
          message: 'Error fetching user or user not authenticated'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Processing repair for user: ${user.id}, email: ${user.email}`);
    
    // Function to create a company if needed
    const createDefaultCompany = async (userId) => {
      const companyName = `Default Company for ${userId.substring(0, 8)}`;
      
      const { data: company, error } = await supabaseClient
        .from('companies')
        .insert({
          name: companyName,
          created_by: userId,
          is_active: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }
      
      console.log('Created default company:', company);
      return company;
    };
    
    // Function to ensure company_users record exists
    const ensureCompanyUserExists = async (userId, companyId) => {
      // Check if company_user already exists
      const { data: existingAssoc, error: checkError } = await supabaseClient
        .from('company_users')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId);
      
      if (checkError) {
        console.error('Error checking company user:', checkError);
        throw checkError;
      }
      
      // If association already exists, return it
      if (existingAssoc && existingAssoc.length > 0) {
        console.log('Company user association already exists:', existingAssoc[0]);
        
        // Make sure is_primary_company is set to true
        if (!existingAssoc[0].is_primary_company) {
          const { error: updateError } = await supabaseClient
            .from('company_users')
            .update({ is_primary_company: true })
            .eq('id', existingAssoc[0].id);
          
          if (updateError) {
            console.error('Error updating primary company flag:', updateError);
          }
        }
        
        return existingAssoc[0];
      }
      
      // Create new company_user association
      const { data: companyUser, error } = await supabaseClient
        .from('company_users')
        .insert({
          user_id: userId,
          company_id: companyId,
          is_primary_company: true,
          is_active: true,
          role: 'admin'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating company user:', error);
        throw error;
      }
      
      console.log('Created company user association:', companyUser);
      return companyUser;
    };
    
    // Function to ensure company_features record exists
    const ensureCompanyFeaturesExist = async (companyId) => {
      // Check if features already exist
      const { data: existingFeatures, error: checkError } = await supabaseClient
        .from('company_features')
        .select('*')
        .eq('company_id', companyId);
      
      if (checkError) {
        console.error('Error checking company features:', checkError);
        throw checkError;
      }
      
      // If features already exist, return them
      if (existingFeatures && existingFeatures.length > 0) {
        console.log('Company features already exist:', existingFeatures[0]);
        return existingFeatures[0];
      }
      
      // Create new company_features record
      const { data: features, error } = await supabaseClient
        .from('company_features')
        .insert({
          company_id: companyId,
          google_jobs_enabled: true // Enable by default
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating company features:', error);
        throw error;
      }
      
      console.log('Created company features:', features);
      return features;
    };
    
    // Function to ensure user_roles record exists
    const ensureUserRolesExist = async (userId) => {
      // Check if user_roles already exist
      const { data: existingRoles, error: checkError } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      
      if (checkError) {
        console.error('Error checking user roles:', checkError);
        throw checkError;
      }
      
      // If roles already exist, return them
      if (existingRoles && existingRoles.length > 0) {
        console.log('User roles already exist:', existingRoles);
        return existingRoles;
      }
      
      // Create new user_roles record
      const { data: roles, error } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'customer',
          is_active: true
        })
        .select();
      
      if (error) {
        console.error('Error creating user roles:', error);
        throw error;
      }
      
      console.log('Created user roles:', roles);
      return roles;
    };
    
    // Main repair logic
    const repairUserAssociations = async () => {
      // Check if the user has a company association
      const { data: companyUsers, error: cuError } = await supabaseClient
        .from('company_users')
        .select('company_id, is_primary_company')
        .eq('user_id', user.id);
      
      if (cuError) {
        console.error('Error fetching company users:', cuError);
        throw cuError;
      }
      
      let companyId;
      let companyUser;
      
      // If no company association exists, create a default company
      if (!companyUsers || companyUsers.length === 0) {
        console.log('No company association found, creating default company');
        const company = await createDefaultCompany(user.id);
        companyId = company.id;
        
        // Create company_user association
        companyUser = await ensureCompanyUserExists(user.id, companyId);
      } else {
        // Use the primary company or the first one
        const primaryCompany = companyUsers.find(cu => cu.is_primary_company) || companyUsers[0];
        companyId = primaryCompany.company_id;
        
        // Ensure the company_user association has is_primary_company set
        companyUser = await ensureCompanyUserExists(user.id, companyId);
      }
      
      // Ensure company_features exist for the company
      const features = await ensureCompanyFeaturesExist(companyId);
      
      // Ensure user_roles exist for the user
      const roles = await ensureUserRolesExist(user.id);
      
      return {
        companyId,
        companyUser,
        features,
        roles
      };
    };
    
    // Execute the repair
    const result = await repairUserAssociations();
    
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'User associations repaired successfully',
        data: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in repair-company-associations:', error);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error.message || 'An unexpected error occurred',
        error: String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
