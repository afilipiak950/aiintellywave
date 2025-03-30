
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
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Parse request body
    const body = await req.json()
    const { email, name, company_id, role = 'customer', language = 'en' } = body
    
    console.log(`Request body:`, body)
    
    if (!email || !name || !company_id) {
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
        role, // Use the role from the request
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
    console.log('Step 3: Adding user to user_roles table')
    
    // Here we need to ensure the role matches the expected type
    // If user_role is an enum type, we need to cast the string value
    const { error: userRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userId,
        role, // Use the role from the request as a text value, not user_role type
      })
    
    if (userRoleError) {
      console.error('Error adding user role:', userRoleError)
      // This is not critical, so we'll log but not throw
      console.warn('User created but role assignment had issues')
    }
    
    console.log('User creation process completed successfully')
    
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
