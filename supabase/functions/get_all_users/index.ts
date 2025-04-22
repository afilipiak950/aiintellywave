
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Initialize Supabase client with the client's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if the user is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Failed to get user information' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin through user_roles
    const { data: userRole, error: userRoleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    // Also check for special admin (admin@intellywave.de)
    const isAdmin = userRole?.role === 'admin' || user.email === 'admin@intellywave.de';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Create service role client for admin access (bypasses RLS)
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users from auth.users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    // Create a map of profiles for quick lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Fetch company_users
    const { data: companyUsers, error: companyUsersError } = await supabaseAdmin
      .from('company_users')
      .select(`
        user_id,
        company_id,
        role,
        is_admin,
        email,
        companies:company_id (
          id,
          name
        )
      `);

    // Create a map of company_users for quick lookup
    const companyUserMap = new Map();
    if (companyUsers) {
      companyUsers.forEach(cu => {
        companyUserMap.set(cu.user_id, cu);
      });
    }

    // Process and format the user data
    const formattedUsers = authUsers.users.map(user => {
      const profile = profileMap.get(user.id);
      const companyUser = companyUserMap.get(user.id);
      
      // Extract name data from various sources
      const firstName = user.user_metadata?.first_name || profile?.first_name || '';
      const lastName = user.user_metadata?.last_name || profile?.last_name || '';
      const fullName = user.user_metadata?.full_name || 
                      (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '') ||
                      `${firstName} ${lastName}`.trim() ||
                      user.email.split('@')[0];
      
      return {
        id: user.id,
        user_id: user.id,
        name: fullName,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        email: user.email,
        contact_email: user.email,
        role: companyUser?.role || '',
        is_admin: companyUser?.is_admin || false,
        company_id: companyUser?.company_id || null,
        company_name: companyUser?.companies?.name || '',
        company: companyUser?.companies?.name || '',
        company_role: companyUser?.role || '',
        avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        status: profile?.is_active !== false ? 'active' : 'inactive',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      };
    });

    return new Response(
      JSON.stringify({ data: formattedUsers, count: formattedUsers.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
