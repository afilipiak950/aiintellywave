
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
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      throw new Error('Server configuration error');
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') ?? '' },
        },
      }
    )
    
    // Get the current authenticated user to check if admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error('Error getting user from token:', userError);
      throw new Error('Unauthorized: Invalid token');
    }
    
    // Check if the user is an admin in company_users
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from('company_users')
      .select('is_admin, role')
      .eq('user_id', userData.user.id)
      .eq('is_admin', true);
      
    const isAdmin = userRoles && userRoles.length > 0 && 
                   (userRoles[0].is_admin === true || userRoles[0].role === 'admin');
                   
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admin users can list all users');
    }
    
    console.log('Admin user verified, fetching all users');
    
    // Fetch all users using the service role
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    return new Response(
      JSON.stringify({
        users: users.users,
        totalCount: users.users.length,
      }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in list-users function:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
})
