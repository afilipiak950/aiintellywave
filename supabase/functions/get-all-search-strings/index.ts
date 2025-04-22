
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache'
};

serve(async (req: Request) => {
  console.log("get-all-search-strings function called");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with admin credentials to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials in environment variables");
      return new Response(
        JSON.stringify({ error: 'Configuration error: Missing Supabase credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test database connection first
    const { data: testData, error: testError } = await supabase
      .from('search_strings')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('Database connection test failed:', testError);
      return new Response(
        JSON.stringify({ error: 'Database connection error', details: testError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log('Database connection successful, proceeding with query');
    
    // Fetch all search strings without any filtering
    // Using service role key bypasses RLS policies
    const { data, error } = await supabase
      .from('search_strings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) {
      console.error('Error fetching search strings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    console.log(`Successfully fetched ${data?.length || 0} search strings`);
    
    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error in get-all-search-strings function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
