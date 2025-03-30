
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
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
    
    // Step 1: Create the user in the auth system
    console.log('Step 1: Creating user in auth system')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email for testing
      user_metadata: {
        name,
        role, // Store role in user metadata
        company_id,
        language,
      }
    })
    
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
    
    const userId = authData.user.id
    console.log(`User created with ID: ${userId}`)
    
    // Step 2: Add user to the company_users table with appropriate role
    console.log('Step 2: Adding user to company_users table')
    const { error: companyUserError } = await supabaseAdmin
      .from('company_users')
      .insert({
        user_id: userId,
        company_id,
        role, // Use the role from the request as string
        is_admin: role === 'admin', // Set is_admin based on role
        email, // Include email for easier access
        full_name: name, // Include name for easier access
      })
    
    if (companyUserError) {
      console.error('Error adding user to company:', companyUserError)
      return new Response(
        JSON.stringify({ error: `Error adding user to company: ${companyUserError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Step 3: Also add to user_roles table for compatibility
    // BUT SKIP THIS STEP if there are issues with the user_roles table
    // This is to prevent the entire function from failing due to user_roles issues
    try {
      console.log('Step 3: Adding user to user_roles table')
      
      const userRolePayload = {
        user_id: userId,
        role: role // Use role as plain text string
      }
      console.log('user_roles insert payload:', userRolePayload)
      
      const { data: roleData, error: userRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert(userRolePayload)
      
      if (userRoleError) {
        // Log but continue - this is not critical
        console.warn('User role assignment had issues (non-critical):', userRoleError.message)
      } else {
        console.log('Role assignment successful')
      }
    } catch (roleError) {
      // Just log the error and continue - we don't want to fail the entire function
      console.warn('Error with user_roles table (non-critical):', roleError)
    }
    
    console.log('User creation process completed successfully')
    
    // Always return a successful response if we reach here
    return new Response(
      JSON.stringify({ 
        id: userId, 
        email, 
        name, 
        company_id,
        role,
        success: true 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
