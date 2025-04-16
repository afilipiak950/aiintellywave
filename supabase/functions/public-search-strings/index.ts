
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchString {
  id: string;
  user_id: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  generated_string?: string;
  type: string;
  input_source: string;
  status: string;
  is_processed: boolean;
  error?: string;
  progress?: number;
  processed_at?: string;
  processed_by?: string;
}

serve(async (req: Request) => {
  console.log("Public search strings API function called");
  
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
    
    // Parse query parameters for sorting and filtering
    const url = new URL(req.url);
    const sortField = url.searchParams.get('sortField') || 'created_at';
    const sortDirection = url.searchParams.get('sortDirection') || 'desc';
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    console.log(`Fetching search strings with parameters: sortField=${sortField}, sortDirection=${sortDirection}, limit=${limit}, offset=${offset}`);

    // Execute query to fetch all search strings without any RLS restrictions
    let query = supabase
      .from('search_strings')
      .select('*')
      .order(sortField, { ascending: sortDirection === 'asc' });
    
    // Add limit and offset for pagination
    if (limit > 0) {
      query = query.range(offset, offset + limit - 1);
    }
    
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
        totalCount: totalCount || data?.length || 0,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error in public search strings function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
