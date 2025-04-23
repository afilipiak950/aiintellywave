
// This edge function retrieves search strings for a user
// It bypasses RLS policies that might be causing infinite recursion errors
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS and main request
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get the user ID from the request body or parameters
    const url = new URL(req.url);
    let userId = req.headers.get('userId') || url.searchParams.get('userId') || '';
    
    // If userId is not provided in headers or URL, try to get it from the request body
    if (!userId) {
      try {
        const body = await req.json().catch(() => ({}));
        userId = body.userId || '';
      } catch (e) {
        console.log('Failed to parse request body:', e);
      }
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Query search_strings table directly using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching search strings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully fetched ${data.length} search strings for user ${userId}`);
    
    return new Response(
      JSON.stringify({ searchStrings: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
