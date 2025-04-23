
// This edge function creates a search string, bypassing any RLS issues
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
    // Get the data from the request body
    const {
      user_id,
      company_id,
      type,
      input_source,
      input_text,
      input_url
    } = await req.json();
    
    // Validate required fields
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!type || !input_source) {
      return new Response(
        JSON.stringify({ error: 'type and input_source are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
    
    // Insert the search string
    const { data: searchString, error: insertError } = await supabase
      .from('search_strings')
      .insert({
        user_id,
        company_id,
        type,
        input_source,
        input_text: input_source === 'text' ? input_text : undefined,
        input_url: input_source === 'website' ? input_url : undefined,
        status: 'new',
        is_processed: false,
        progress: 0
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating search string:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Successfully created search string with ID: ${searchString.id}`);
    
    return new Response(
      JSON.stringify({ searchString }),
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
