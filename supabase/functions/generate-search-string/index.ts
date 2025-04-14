
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { search_string_id, type, input_source, input_text, input_url, user_id } = await req.json();
    
    if (!search_string_id) {
      return new Response(
        JSON.stringify({ error: 'search_string_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update status to processing with 5% progress
    await supabase
      .from('search_strings')
      .update({
        status: 'processing',
        progress: 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id);
    
    let content = '';
    
    // Process different input sources
    if (input_source === 'text' && input_text) {
      content = input_text;
      
      // Update progress
      await supabase
        .from('search_strings')
        .update({
          progress: 30,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
    } else if (input_source === 'website' && input_url) {
      try {
        // Update progress - scraping started
        await supabase
          .from('search_strings')
          .update({
            progress: 15,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
        // Call website-scraper function to get the content
        const { data: scraperData, error: scraperError } = await supabase.functions
          .invoke('website-scraper', {
            body: { url: input_url },
          });
          
        if (scraperError || !scraperData.success) {
          throw new Error(scraperError || scraperData.error || 'Unknown error scraping website');
        }
        
        content = scraperData.text;
        
        // Update progress - scraping completed
        await supabase
          .from('search_strings')
          .update({
            progress: 40,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
      } catch (e) {
        console.error('Error scraping website:', e);
        throw new Error(`Failed to scrape website: ${e.message}`);
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid input source or missing required data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Generate search string
    try {
      // Update progress - starting generation
      await supabase
        .from('search_strings')
        .update({
          progress: 60,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
      
      // Generate the search string (simplified for this example)
      const searchString = generateBasicSearchString(content, type);
      
      // Update progress - generation completed
      await supabase
        .from('search_strings')
        .update({
          generated_string: searchString,
          status: 'completed',
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (e) {
      console.error('Error generating search string:', e);
      
      // Update status to failed
      await supabase
        .from('search_strings')
        .update({
          status: 'failed',
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      throw e;
    }
    
  } catch (error) {
    console.error('Error in generate-search-string function:', error);
    
    return new Response(
      JSON.stringify({ error: `Function error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Basic search string generation as a fallback
function generateBasicSearchString(text: string, type: string): string {
  // Extract all words from text
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates - case insensitive conversion
  const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())))
    .map(lowerCaseWord => {
      // Find the original word with preserved casing
      const original = words.find(w => w.toLowerCase() === lowerCaseWord);
      return original || lowerCaseWord;
    });
  
  // Basic stopwords
  const stopwords = [
    "and", "the", "with", "from", "this", "that", "have", "been", "would", "there", "their",
    "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das", "sie", "und", 
    "für", "auf", "ist", "sind", "oder", "als", "dann", "nach", "durch", "über", "unter",
    "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for"
  ];
  
  // Filter out stopwords (case insensitive)
  const filteredWords = uniqueWords.filter(word => !stopwords.includes(word.toLowerCase()));
  
  // Take the most important words (up to 15)
  const importantWords = filteredWords.slice(0, 15);
  
  // Build search string based on type with proper Boolean logic
  let searchString = "";
  
  if (type === "recruiting") {
    // For recruiting, add job-related keywords
    searchString = importantWords.join(" AND ") + ' AND ("resume" OR "CV" OR "curriculum vitae")';
  } else {
    // For lead generation, add business-related keywords
    searchString = importantWords.join(" AND ") + ' AND ("company" OR "business" OR "enterprise")';
  }
  
  return searchString;
}
