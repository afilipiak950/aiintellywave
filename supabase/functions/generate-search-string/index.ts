
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";
import { extractKeywordsAndPhrases } from "./utils.ts";

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
    
    console.log(`Processing search string: id=${search_string_id}, type=${type}, source=${input_source}`);
    
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
    
    // Update search string status to show we're generating
    try {
      console.log(`Updating search string status to processing: ${search_string_id}`);
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({ 
          status: 'processing',
          progress: 25,
          error: null // Clear any previous errors
        })
        .eq('id', search_string_id);
      
      if (updateError) {
        console.error('Error updating search string status:', updateError);
        return new Response(
          JSON.stringify({ error: `Database error: ${updateError.message}` }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      return new Response(
        JSON.stringify({ error: `Database error: ${err.message || 'Unknown error'}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get input content
    let contentToProcess = '';
    
    if (input_source === 'text') {
      contentToProcess = input_text || '';
      console.log(`Processing text input (${contentToProcess.length} chars)`);
    } else if (input_source === 'website' && input_url) {
      console.log(`Processing website URL: ${input_url}`);
      contentToProcess = `Website content from ${input_url}`;
      // In a real implementation, you would fetch and process the website content here
    } else {
      // Update search string as failed
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: 'Invalid input source or missing data',
          progress: 100
        })
        .eq('id', search_string_id);
      
      return new Response(
        JSON.stringify({ error: 'Invalid input source or missing data' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate content length
    if (contentToProcess.length < 10) {
      const errorMessage = 'Insufficient content provided for generation. Please provide more text (at least 10 characters).';
      console.error(errorMessage);
      
      // Update search string as failed due to insufficient content
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: errorMessage,
          progress: 100
        })
        .eq('id', search_string_id);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage 
        }),
        { 
          status: 200,  // Return 200 to avoid non-2xx error
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Update progress
    await supabase
      .from('search_strings')
      .update({ progress: 50 })
      .eq('id', search_string_id);
    
    console.log(`Extracting keywords from content (${contentToProcess.length} chars)`);
    
    try {
      // Extract keywords from the content
      const keywords = extractKeywordsAndPhrases(contentToProcess);
      
      if (!keywords || keywords.length === 0) {
        const errorMessage = 'Could not extract meaningful keywords from the provided content. Please try with more specific text.';
        console.error(errorMessage);
        
        // Update as failed with a clear message
        await supabase
          .from('search_strings')
          .update({ 
            status: 'failed',
            error: errorMessage,
            progress: 100
          })
          .eq('id', search_string_id);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: errorMessage 
          }),
          { 
            status: 200, // Return 200 to avoid non-2xx error
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Update progress
      await supabase
        .from('search_strings')
        .update({ progress: 75 })
        .eq('id', search_string_id);
      
      // Generate the search string using extracted keywords
      // Limit to top 5 keywords for better results
      const topKeywords = keywords.slice(0, 5);
      
      // Create boolean search string format based on the type
      let generatedString = '';
      
      if (type === 'recruiting') {
        generatedString = `"${type}" AND (${topKeywords.join(" OR ")})`;
      } else if (type === 'sales') {
        generatedString = `"${type}" AND (${topKeywords.join(" OR ")})`;
      } else {
        generatedString = `"${type || 'general'}" AND (${topKeywords.join(" OR ")})`;
      }
      
      console.log(`Generated search string: ${generatedString}`);
      
      // Update search string with generated content
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
      await supabase
        .from('search_strings')
        .update({ 
          status: 'failed',
          error: `Generation error: ${error.message || 'Unknown error occurred'}`,
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Failed to generate search string: ${error.message || 'Unknown error'}` 
        }),
        { 
          status: 200, // Return 200 to avoid non-2xx error 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Server error: ${error.message || 'Unknown error'}` 
      }),
      { 
        status: 200, // Return 200 to avoid non-2xx error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
