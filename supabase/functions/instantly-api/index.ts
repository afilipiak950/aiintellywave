import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from './corsHeaders.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const instantlyApiKey = Deno.env.get('INSTANTLY_API_KEY') || ''

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Get request body
    const { action } = await req.json()

    // Verify the request has a valid session
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the user is an admin
    const { data: roleData, error: roleError } = await supabase
      .rpc('is_admin_user_safe')

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Only admin users can sync workflows' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Based on action parameter, perform different operations
    switch (action) {
      case 'sync_workflows':
        return await syncWorkflows(req)
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function syncWorkflows(req: Request) {
  try {
    console.log('Starting Instantly workflow sync...')
    
    // Get API Key and URL from config
    const { data: configData, error: configError } = await supabase
      .from('instantly_integration.config')
      .select('api_key, api_url')
      .limit(1)
      .single()
    
    if (configError) {
      console.error('Error fetching config:', configError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get Instantly API configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const apiKey = configData.api_key || instantlyApiKey
    const apiUrl = configData.api_url || 'https://api.instantly.ai/api/v1'
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Instantly API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Log API calls to database
    const startTime = performance.now()
    
    // Call Instantly API to fetch workflows
    const workflowsEndpoint = `${apiUrl}/workflows`
    console.log(`Fetching workflows from ${workflowsEndpoint}`)
    
    const response = await fetch(workflowsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    
    // Log the API call
    await supabase
      .from('instantly_integration.logs')
      .insert({
        endpoint: 'workflows',
        status: response.status,
        duration_ms: duration,
        error_message: response.ok ? null : await response.text()
      })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      return new Response(
        JSON.stringify({ success: false, error: `API Error (${response.status}): ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const data = await response.json()
    console.log(`Fetched ${data.workflows?.length || 0} workflows`)
    
    // Update config with last sync time
    await supabase
      .from('instantly_integration.config')
      .update({ last_updated: new Date().toISOString() })
      .eq('id', configData.id)
    
    // Process and store workflows
    let inserted = 0
    let updated = 0
    let errors = 0
    
    if (data.workflows && Array.isArray(data.workflows)) {
      for (const workflow of data.workflows) {
        try {
          // Check if workflow already exists
          const { data: existingData, error: findError } = await supabase
            .from('instantly_integration.workflows')
            .select('id')
            .eq('workflow_id', workflow.id)
            .maybeSingle()
          
          if (findError) {
            console.error(`Error checking for existing workflow: ${findError.message}`)
            errors++
            continue
          }
          
          const workflowData = {
            workflow_id: workflow.id,
            workflow_name: workflow.name || 'Untitled Workflow',
            description: workflow.description || null,
            status: workflow.status || 'inactive',
            is_active: workflow.active === true,
            tags: workflow.tags || [],
            raw_data: workflow,
            updated_at: new Date().toISOString()
          }
          
          if (existingData) {
            // Update existing workflow
            const { error: updateError } = await supabase
              .from('instantly_integration.workflows')
              .update(workflowData)
              .eq('id', existingData.id)
            
            if (updateError) {
              console.error(`Error updating workflow: ${updateError.message}`)
              errors++
            } else {
              updated++
            }
          } else {
            // Insert new workflow
            const { error: insertError } = await supabase
              .from('instantly_integration.workflows')
              .insert({
                ...workflowData,
                created_at: new Date().toISOString()
              })
            
            if (insertError) {
              console.error(`Error inserting workflow: ${insertError.message}`)
              errors++
            } else {
              inserted++
            }
          }
        } catch (workflowError) {
          console.error(`Error processing workflow: ${workflowError.message}`)
          errors++
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${inserted + updated} workflows (${inserted} new, ${updated} updated)${errors > 0 ? `, with ${errors} errors` : ''}`,
        inserted,
        updated,
        errors
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing workflows:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to sync workflows', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}
