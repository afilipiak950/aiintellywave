
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.1'

serve(async (req) => {
  try {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session to verify the user is authenticated
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession()

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated', session: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Test RLS policy access
    const { data: leadsAccess, error: leadsError } = await supabaseClient
      .from('leads')
      .select('id')
      .limit(1)

    const { data: projectsAccess, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id')
      .limit(1)

    const result = {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      access: {
        leads: {
          success: !leadsError,
          error: leadsError ? leadsError.message : null,
          data: leadsAccess,
        },
        projects: {
          success: !projectsError,
          error: projectsError ? projectsError.message : null,
          data: projectsAccess,
        },
      },
    }

    console.log('RLS check result:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in RLS check:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
