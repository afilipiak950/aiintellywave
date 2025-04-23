
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create JSON response
const jsonResponse = (data: any, status: number = 200) => {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
};

// Helper function to validate required fields
const validateFields = (data: any) => {
  const requiredFields = ['user_id', 'type', 'input_source'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  
  // Additionally validate input fields based on input_source
  if (data.input_source === 'text' && !data.input_text) {
    return 'input_text is required when input_source is "text"';
  }
  
  if (data.input_source === 'website' && !data.input_url) {
    return 'input_url is required when input_source is "website"';
  }
  
  return null; // No validation errors
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
    // Get request data
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }
    
    const { 
      user_id, 
      company_id, 
      type, 
      input_source, 
      input_text, 
      input_url 
    } = requestData;

    // Validate required fields
    const validationError = validateFields(requestData);
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return jsonResponse({ error: 'Server configuration error' }, 500);
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Creating search string with data:', {
      user_id,
      company_id,
      type,
      input_source,
      input_text: input_source === 'text' ? (input_text ? 'yes' : 'no') : 'n/a',
      input_url: input_source === 'website' ? (input_url ? 'yes' : 'no') : 'n/a',
    });
    
    // Create search string using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('search_strings')
      .insert({
        user_id,
        company_id,
        type,
        input_source,
        input_text: input_source === 'text' ? input_text : null,
        input_url: input_source === 'website' ? input_url : null,
        status: 'new',
        is_processed: false,
        progress: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating search string:', error);
      return jsonResponse({ error: error.message }, 500);
    }
    
    console.log(`Successfully created search string for user ${user_id}`);
    
    return jsonResponse({ searchString: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return jsonResponse({ error: 'An unexpected error occurred' }, 500);
  }
});
