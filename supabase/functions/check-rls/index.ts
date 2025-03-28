
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.1.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
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

    // Test RLS policy access with detailed diagnostics
    const { data: leadsAccess, error: leadsError } = await supabaseClient
      .from('leads')
      .select('id, name, status, project_id')
      .limit(10)

    const { data: leadCount, error: countError } = await supabaseClient
      .from('leads')
      .select('id', { count: 'exact', head: true })

    const { data: projectsAccess, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .limit(10)

    // Try to insert a test lead
    const testLead = {
      name: `Test Lead ${Date.now()}`,
      status: 'new',
      notes: 'Created by RLS check',
    }

    const { data: insertedLead, error: insertError } = await supabaseClient
      .from('leads')
      .insert(testLead)
      .select('*')
      .single()

    const result = {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      database: {
        leads: {
          select: {
            success: !leadsError,
            error: leadsError ? leadsError.message : null,
            count: leadCount?.count || 0,
            data: leadsAccess,
          },
          insert: {
            success: !insertError,
            error: insertError ? insertError.message : null,
            data: insertedLead || null,
          }
        },
        projects: {
          success: !projectsError,
          error: projectsError ? projectsError.message : null,
          data: projectsAccess,
        },
      },
      rls_policies: {
        checked: ['leads', 'projects'],
      }
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
