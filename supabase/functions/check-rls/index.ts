
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
    
    // Test leads table access
    const { data: leadsAccess, error: leadsError } = await supabaseClient
      .from('leads')
      .select('id, name, status, project_id')
      .limit(10)

    const { count: leadCount, error: countError } = await supabaseClient
      .from('leads')
      .select('id', { count: 'exact', head: true })

    diagnostic_results['leads'] = {
      select: {
        success: !leadsError,
        error: leadsError ? leadsError.message : null,
        count: leadCount || 0,
        data: leadsAccess,
      }
    };

    // Test projects table access
    const { data: projectsAccess, error: projectsError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .limit(10)

    diagnostic_results['projects'] = {
      success: !projectsError,
      error: projectsError ? projectsError.message : null,
      data: projectsAccess,
    };

    // Test company_users table access
    const { data: companyUsersAccess, error: companyUsersError } = await supabaseClient
      .from('company_users')
      .select('id, company_id, user_id, role')
      .limit(5)

    diagnostic_results['company_users'] = {
      success: !companyUsersError,
      error: companyUsersError ? companyUsersError.message : null,
      data: companyUsersAccess,
    };

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

    diagnostic_results['leads']['insert'] = {
      success: !insertError,
      error: insertError ? insertError.message : null,
      data: insertedLead || null,
    };

    // Check user roles
    const { data: userRoles, error: userRolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    diagnostic_results['user_roles'] = {
      success: !userRolesError,
      error: userRolesError ? userRolesError.message : null,
      data: userRoles,
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
