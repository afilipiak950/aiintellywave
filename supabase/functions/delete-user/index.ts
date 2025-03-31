
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/projects
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('userId is required')
    }

    console.log(`Attempting to delete user with ID: ${userId}`)

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )
    
    // Check if the user exists first
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError)
      throw userCheckError
    }
    
    if (!existingUser || !existingUser.user) {
      console.log(`User ${userId} not found in auth system, cleaning up other tables only`)
    } else {
      console.log(`User found: ${existingUser.user.email}`)
    }

    // Start a transaction to delete all related data
    // First delete records in tables that reference the user
    console.log('Deleting related user data from company_users table...')
    const { error: companyUserDeleteError } = await supabaseAdmin
      .from('company_users')
      .delete()
      .eq('user_id', userId)
    
    if (companyUserDeleteError) {
      console.error('Error deleting from company_users:', companyUserDeleteError)
      // Continue with other deletes even if this fails
    }

    console.log('Deleting related user data from profiles table...')
    const { error: profileDeleteError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileDeleteError) {
      console.error('Error deleting from profiles:', profileDeleteError)
      // Continue with other deletes even if this fails
    }
    
    console.log('Deleting related user data from user_roles table...')
    const { error: userRolesDeleteError } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
    
    if (userRolesDeleteError) {
      console.error('Error deleting from user_roles:', userRolesDeleteError)
      // Continue with other deletes even if this fails
    }

    console.log('Deleting related user data from user_settings table...')
    const { error: userSettingsDeleteError } = await supabaseAdmin
      .from('user_settings')
      .delete()
      .eq('user_id', userId)
    
    if (userSettingsDeleteError) {
      console.error('Error deleting from user_settings:', userSettingsDeleteError)
      // Continue with other deletes even if this fails
    }

    console.log('Deleting related user data from notifications table...')
    const { error: notificationsDeleteError } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    
    if (notificationsDeleteError) {
      console.error('Error deleting from notifications:', notificationsDeleteError)
      // Continue with other deletes even if this fails
    }

    // Check for additional tables that might have user references
    console.log('Deleting related user data from email_integrations table...')
    const { error: emailIntegrationsDeleteError } = await supabaseAdmin
      .from('email_integrations')
      .delete()
      .eq('user_id', userId)
    
    if (emailIntegrationsDeleteError) {
      console.error('Error deleting from email_integrations:', emailIntegrationsDeleteError)
      // Continue with other deletes even if this fails
    }
    
    console.log('Deleting related user data from email_messages table...')
    const { error: emailMessagesDeleteError } = await supabaseAdmin
      .from('email_messages')
      .delete()
      .eq('user_id', userId)
    
    if (emailMessagesDeleteError) {
      console.error('Error deleting from email_messages:', emailMessagesDeleteError)
      // Continue with other deletes even if this fails
    }
    
    console.log('Deleting related user data from ai_personas table...')
    const { error: aiPersonasDeleteError } = await supabaseAdmin
      .from('ai_personas')
      .delete()
      .eq('user_id', userId)
    
    if (aiPersonasDeleteError) {
      console.error('Error deleting from ai_personas:', aiPersonasDeleteError)
      // Continue with other deletes even if this fails
    }

    console.log('Deleting related user data from user_2fa table...')
    const { error: user2faDeleteError } = await supabaseAdmin
      .from('user_2fa')
      .delete()
      .eq('user_id', userId)
    
    if (user2faDeleteError) {
      console.error('Error deleting from user_2fa:', user2faDeleteError)
      // Continue with other deletes even if this fails
    }

    // Only delete from auth.users if user exists there
    if (existingUser && existingUser.user) {
      console.log('Deleting user from auth.users...')
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authDeleteError) {
        console.error('Error deleting from auth.users:', authDeleteError)
        throw authDeleteError
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User and related data deleted successfully' }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error in delete-user function:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})
