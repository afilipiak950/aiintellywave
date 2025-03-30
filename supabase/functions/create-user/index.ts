
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("Request received for create-user function")
  
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
    let companyUserError = null

    // Step 1: Create the user in the auth system
    try {
      console.log('Step 1: Creating user in auth system')
      
      const authResult = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Auto-confirm email for testing
        user_metadata: {
          name,
          role, // Store role in user metadata as a string
          company_id,
          language,
        }
      })
      
      authData = authResult.data
      authError = authResult.error
      
      if (authError) {
        console.error('Error creating auth user:', JSON.stringify(authError))
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
      
      // After this point, we consider user creation successful and will return 200 even if secondary operations fail
      
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
    
    // Step 2: Add user to the company_users table with appropriate role
    // This is a secondary operation - if it fails, we'll log but still return 200
    try {
      console.log('Step 2: Adding user to company_users table')
      
      const companyUserPayload = {
        user_id: userId,
        company_id,
        role, // Store as plain text string
        is_admin: role === 'admin', // Set is_admin based on role
        email, // Include email for easier access
        full_name: name, // Include name for easier access
      }
      console.log('company_users insert payload:', JSON.stringify(companyUserPayload))
      
      const companyUserResult = await supabaseAdmin
        .from('company_users')
        .insert(companyUserPayload)
      
      companyUserError = companyUserResult.error
      
      if (companyUserError) {
        console.error('Error adding user to company:', JSON.stringify(companyUserError))
        // We still continue - this is non-critical
      } else {
        console.log('User added to company_users successfully')
      }
    } catch (companyError) {
      console.error('Exception during company_users insertion:', companyError)
      companyUserError = companyError
      // Don't return error, continue with next step
    }
    
    // Step 3: Try to add to user_roles table, but SKIP if there are issues
    // We'll completely separate this step so it can't affect the main user creation flow
    let userRoleError = null
    try {
      console.log('Step 3: Adding user to user_roles table')
      
      // First, check if the user_roles table exists by doing a careful select
      try {
        const tableCheck = await supabaseAdmin
          .from('user_roles')
          .select('id')
          .limit(1)
        
        // If we get here without error, table exists - try the insert
        if (!tableCheck.error) {
          console.log('user_roles table exists, attempting insert')
          
          const userRolePayload = {
            user_id: userId,
            role // Plain string without type casting
          }
          console.log('user_roles insert payload:', JSON.stringify(userRolePayload))
          
          const roleResult = await supabaseAdmin
            .from('user_roles')
            .insert(userRolePayload)
          
          if (roleResult.error) {
            console.warn('User role assignment had issues:', roleResult.error.message)
            userRoleError = roleResult.error
          } else {
            console.log('Role assignment successful')
          }
        }
      } catch (tableError) {
        console.warn('user_roles table might not exist:', tableError.message)
        userRoleError = { message: 'user_roles table not accessible' }
      }
    } catch (roleError) {
      console.warn('Error with user_roles operation:', roleError)
      userRoleError = roleError
    }
    
    console.log('User creation process completed successfully')
    
    // Always return 200 here - the main user was created successfully
    // We include any secondary errors in the response
    return new Response(
      JSON.stringify({ 
        id: userId, 
        email, 
        name, 
        company_id,
        role,
        success: true,
        company_user_error: companyUserError ? companyUserError.message : null,
        user_role_error: userRoleError ? 
          (typeof userRoleError === 'object' && userRoleError.message ? 
            userRoleError.message : JSON.stringify(userRoleError)) : null
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
