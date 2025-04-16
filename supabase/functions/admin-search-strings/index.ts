
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sort-field, x-sort-direction, x-limit, x-offset, x-filter',
};

serve(async (req: Request) => {
  console.log("Admin search strings function called");
  
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
        JSON.stringify({ 
          error: 'Configuration error: Missing Supabase credentials' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request URL for query parameters
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || '';
    const sortField = url.searchParams.get('sortField') || 'created_at';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    console.log(`Fetching search strings with parameters: filter=${filter}, sortField=${sortField}, sortDirection=${sortDirection}, limit=${limit}, offset=${offset}`);

    // Execute query to fetch all search strings without any RLS restrictions
    // Build the query incrementally
    let query = supabase
      .from('search_strings')
      .select('*');
    
    // Add filter condition if provided
    if (filter) {
      query = query.or(`input_text.ilike.%${filter}%,input_url.ilike.%${filter}%,generated_string.ilike.%${filter}%`);
    }
    
    // Add sorting
    query = query.order(sortField, { ascending: sortDirection === 'asc' });
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching search strings:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Count total records for pagination info
    const { count: totalCount, error: countError } = await supabase
      .from('search_strings')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting search strings:', countError);
    }
    
    console.log(`Successfully fetched ${data?.length || 0} search strings out of ${totalCount || 'unknown'} total records`);
    
    return new Response(
      JSON.stringify({ 
        data: data || [], 
        totalCount: totalCount || 0,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error in admin search strings function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
