
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.0'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  {
    global: {
      headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` },
    },
    auth: {
      persistSession: false,
    },
  }
)

// Main server function
serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/')
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    
    // Authenticate the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Extract parameters from URL
    const platform = path[4] // linkedin or xing
    const integrationId = path[5] // for delete operations
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST': {
        // Handle POST request to save credentials
        const body = await req.json()
        const { username, password } = body
        
        if (!username || !password) {
          return new Response(JSON.stringify({ error: 'Username and password are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        // Check if user already has an integration for this platform
        const { data: existingIntegrations } = await supabaseClient
          .from('social_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', platform)
        
        if (existingIntegrations && existingIntegrations.length > 0) {
          // Update existing integration
          const { data, error } = await supabaseClient
            .from('social_integrations')
            .update({
              username,
              password,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingIntegrations[0].id)
            .select()
            .single()
          
          if (error) {
            console.error('Error updating integration:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          
          return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Create new integration
          const { data, error } = await supabaseClient
            .from('social_integrations')
            .insert([
              {
                user_id: user.id,
                platform,
                username,
                password,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single()
          
          if (error) {
            console.error('Error creating integration:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          
          return new Response(JSON.stringify({ success: true, data }), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }
      
      case 'DELETE': {
        // Handle DELETE request to remove integration
        if (!integrationId) {
          return new Response(JSON.stringify({ error: 'Integration ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        // First verify the integration belongs to this user
        const { data: existingIntegration } = await supabaseClient
          .from('social_integrations')
          .select('*')
          .eq('id', integrationId)
          .eq('user_id', user.id)
          .single()
        
        if (!existingIntegration) {
          return new Response(JSON.stringify({ error: 'Integration not found or access denied' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        // Delete the integration
        const { error } = await supabaseClient
          .from('social_integrations')
          .delete()
          .eq('id', integrationId)
        
        if (error) {
          console.error('Error deleting integration:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    console.error('Unhandled error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
