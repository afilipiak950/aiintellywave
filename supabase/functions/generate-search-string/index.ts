
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS request for CORS
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const {
      search_string_id,
      type,
      input_source,
      input_text,
      input_url,
      user_id
    } = await req.json();
    
    if (!search_string_id) {
      return new Response(
        JSON.stringify({ error: 'search_string_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update search string status to show we're generating
    try {
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 50
        })
        .eq('id', search_string_id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
    
    // Generate the search string based on the input
    let generatedString = '';
    
    if (!input_text || input_text.length < 50) {
      // If no text or very short text, update as failed
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: 'Insufficient content provided for generation',
            progress: 100
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string status:', updateError);
        }
      } catch (err) {
        console.error('Failed to update status:', err);
      }
      
      return new Response(
        JSON.stringify({ error: 'Insufficient content provided for generation' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Generating search string for type: ${type}, source: ${input_source}`);
    
    try {
      // For simplicity in this example, let's generate a mock search string
      // In a real implementation, you would process the input text to generate a search string
      generatedString = `"${type}" AND (${input_text.split(" ").slice(0, 5).join(" OR ")})`;
      
      // Update search string with generated content
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            generated_string: generatedString,
            status: 'completed',
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string with generated content:', updateError);
          throw updateError;
        }
      } catch (updateErr) {
        console.error('Failed to update search string with generated content:', updateErr);
        throw updateErr;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          generatedString: generatedString 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error generating search string:', error);
      
      // Update search string status to failed
      try {
        const { error: updateError } = await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: `Generation error: ${error.message}`,
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
        
        if (updateError) {
          console.error('Error updating search string status to failed:', updateError);
        }
      } catch (updateErr) {
        console.error('Failed to update search string status to failed:', updateErr);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to generate search string: ${error.message}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${error.message}` 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
