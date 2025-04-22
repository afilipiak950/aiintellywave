
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the user is an admin
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin through user_roles
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    const isAdmin = userRole?.role === 'admin' || user.email === 'admin@intellywave.de';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Fetch all users from auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch profiles for additional user information
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*');

    // Create a map for efficient profile lookup
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Transform and combine the data
    const formattedUsers = authUsers.users.map(user => {
      const profile = profileMap.get(user.id);
      const firstName = user.user_metadata?.first_name || profile?.first_name || '';
      const lastName = user.user_metadata?.last_name || profile?.last_name || '';
      const fullName = user.user_metadata?.full_name || 
                      (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '') ||
                      `${firstName} ${lastName}`.trim() ||
                      user.email.split('@')[0];

      return {
        id: user.id,
        email: user.email,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        avatar_url: user.user_metadata?.avatar_url || profile?.avatar_url,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        is_active: profile?.is_active !== false,
      };
    });

    return new Response(
      JSON.stringify({ 
        data: formattedUsers, 
        count: formattedUsers.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
