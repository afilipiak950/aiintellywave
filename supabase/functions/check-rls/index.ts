
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

    console.log('Session found for user:', session.user.id);

    // Test RLS policy access with detailed diagnostics for multiple tables
    const diagnostic_results = {};
    
    // Test search_strings table access
    const { data: searchStringsAccess, error: searchStringsError } = await supabaseClient
      .from('search_strings')
      .select('id, type, input_source, status, created_at')
      .limit(10)

    const { count: stringCount, error: countError } = await supabaseClient
      .from('search_strings')
      .select('id', { count: 'exact', head: true })

    diagnostic_results['search_strings'] = {
      select: {
        success: !searchStringsError,
        error: searchStringsError ? searchStringsError.message : null,
        count: stringCount || 0,
        data: searchStringsAccess,
      }
    };

    // Test user_roles table access
    const { data: userRolesAccess, error: userRolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    diagnostic_results['user_roles'] = {
      success: !userRolesError,
      error: userRolesError ? userRolesError.message : null,
      data: userRolesAccess,
    };

    const result = {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      database_access: diagnostic_results,
      rls_policies: {
        checked: Object.keys(diagnostic_results),
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
