
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)')
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    console.log("Starting user creation process")
    
    // Check if required environment variables are set
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
    console.log("Supabase client created")
    
    // Parse request body
    let body
    try {
      body = await req.json()
      console.log(`Request body:`, JSON.stringify(body))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid request body format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const { email, name, company_id, role = 'customer', language = 'en' } = body
    
    // Validate required fields
    if (!email || !name || !company_id) {
      console.error('Missing required fields:', { email, name, company_id })
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: email, name, and company_id are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`Creating user with email: ${email} for company: ${company_id}`)
    
    let userId = null
    let authData = null
    let authError = null

    // Step 1: Create the user in the auth system
    try {
      console.log('Step 1: Creating user in auth system')
      
      const authResult = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
          name,
          role, // Store role in user metadata
          company_id,
          language,
        }
      })
      
      authData = authResult.data
      authError = authResult.error
      
      if (authError) {
        console.error('Error creating auth user:', authError)
        return new Response(
          JSON.stringify({ error: `Error creating user: ${authError.message}` }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      if (!authData?.user) {
        console.error('No user data returned from auth.admin.createUser')
        return new Response(
          JSON.stringify({ error: 'Failed to create user: No user data returned' }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
      
      userId = authData.user.id
      console.log(`User created with ID: ${userId}`)
    } catch (createUserError) {
      console.error('Exception during user creation:', createUserError)
      return new Response(
        JSON.stringify({ error: `Exception during user creation: ${createUserError.message}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // If we reach here, user was created successfully - continue with company_users
    let companyUserError = null
    
    // Step 2: Add user to the company_users table with appropriate role
    try {
      console.log('Step 2: Adding user to company_users table')
      
      const companyUserResult = await supabaseAdmin
        .from('company_users')
        .insert({
          user_id: userId,
          company_id,
          role, // Use the role from the request
          is_admin: role === 'admin', // Set is_admin based on role
          email, // Include email for easier access
          full_name: name, // Include name for easier access
        })
      
      companyUserError = companyUserResult.error
      
      if (companyUserError) {
        console.error('Error adding user to company:', companyUserError)
        // We won't return an error response here as the user has been created
        // Just log the error and continue
      } else {
        console.log('User added to company_users successfully')
      }
    } catch (companyError) {
      console.error('Exception during company_users insertion:', companyError)
      // We won't return an error response here either
      // User is created, just company assignment failed
    }
    
    // Step 3: Also add to user_roles table for compatibility
    // BUT SKIP THIS STEP if there are issues with the user_roles table
    // This is to prevent the entire function from failing due to user_roles issues
    try {
      console.log('Step 3: Adding user to user_roles table')
      
      // We'll try inserting the role as a plain string
      const userRolePayload = {
        user_id: userId,
        role: role // Using role as plain text string
      }
      console.log('user_roles insert payload:', userRolePayload)
      
      const roleResult = await supabaseAdmin
        .from('user_roles')
        .insert(userRolePayload)
      
      if (roleResult.error) {
        // Log but continue - this is not critical
        console.warn('User role assignment had issues (non-critical):', roleResult.error.message)
      } else {
        console.log('Role assignment successful')
      }
    } catch (roleError) {
      // Just log the error and continue - we don't want to fail the entire function
      console.warn('Error with user_roles table (non-critical):', roleError)
    }
    
    console.log('User creation process completed successfully')
    
    // Always return a successful response if the main user was created
    // Even if secondary operations (company_users, user_roles) had issues
    return new Response(
      JSON.stringify({ 
        id: userId, 
        email, 
        name, 
        company_id,
        role,
        success: true,
        company_user_error: companyUserError ? companyUserError.message : null
      }),
      {
        status: 200, // Always use 200 for successful user creation
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Unhandled error in create-user function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
