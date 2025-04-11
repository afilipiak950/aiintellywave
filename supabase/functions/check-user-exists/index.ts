
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Create supabase client with admin rights
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Get request body
    const { userId } = await req.json()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing user ID" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      )
    }
    
    // Try to get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (!authError && authUser?.user) {
      return new Response(
        JSON.stringify({ 
          exists: true, 
          source: 'auth.users',
          user: {
            id: authUser.user.id,
            email: authUser.user.email,
            created_at: authUser.user.created_at
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Check in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    if (!profileError && profileData) {
      return new Response(
        JSON.stringify({ exists: true, source: 'profiles' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Check in company_users table
    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!companyUserError && companyUserData) {
      return new Response(
        JSON.stringify({ exists: true, source: 'company_users' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Check in user_roles table
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!userRoleError && userRoleData) {
      return new Response(
        JSON.stringify({ exists: true, source: 'user_roles' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // User not found in any table
    return new Response(
      JSON.stringify({ exists: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error('Error in check-user-exists function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})
