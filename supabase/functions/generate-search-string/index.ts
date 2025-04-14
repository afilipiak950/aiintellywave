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

    console.log(`Processing search string: ${search_string_id}, type: ${type}, source: ${input_source}`);

    // First, verify the search string exists and get its current state
    const { data: searchString, error: fetchError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('id', search_string_id)
      .single();
      
    if (fetchError || !searchString) {
      console.error('Error fetching search string:', fetchError);
      return new Response(
        JSON.stringify({ error: `Search string not found: ${fetchError?.message || 'Unknown error'}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Update status to processing with 5% progress
    const { error: updateError } = await supabase
      .from('search_strings')
      .update({
        status: 'processing',
        progress: 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id);
      
    if (updateError) {
      console.error('Error updating search string status:', updateError);
      return new Response(
        JSON.stringify({ error: `Failed to update search string status: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    let content = '';
    
    // Process different input sources
    if (input_source === 'text' && input_text) {
      console.log('Processing text input:', input_text);
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
          
        console.log('Scraping website:', input_url);
        // Call website-scraper function to get the content
        const { data: scraperData, error: scraperError } = await supabase.functions
          .invoke('website-scraper', {
            body: { url: input_url },
          });
          
        if (scraperError || !scraperData?.success) {
          throw new Error(scraperError || (scraperData?.error || 'Unknown error scraping website'));
        }
        
        content = scraperData.text;
        console.log('Successfully scraped content, length:', content.length);
        
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
        
        // Update status to failed
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            progress: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
        return new Response(
          JSON.stringify({ error: `Failed to scrape website: ${e.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      // Update status to failed
      await supabase
        .from('search_strings')
        .update({
          status: 'failed',
          progress: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
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
      
      console.log('Generating search string from content');
      // Generate the search string
      const searchString = generateEnhancedSearchString(content, type);
      console.log('Generated search string:', searchString);
      
      // Update progress - generation completed
      const { error: updateError } = await supabase
        .from('search_strings')
        .update({
          generated_string: searchString,
          status: 'completed',
          progress: 100,
          updated_at: new Date().toISOString()
        })
        .eq('id', search_string_id);
        
      if (updateError) {
        console.error('Error updating search string with result:', updateError);
        
        // Update status to failed
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            progress: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', search_string_id);
          
        return new Response(
          JSON.stringify({ error: `Failed to update search string with result: ${updateError.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
        
      return new Response(
        JSON.stringify({ success: true, generated_string: searchString }),
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
        
      return new Response(
        JSON.stringify({ error: `Error generating search string: ${e.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in generate-search-string function:', error);
    
    return new Response(
      JSON.stringify({ error: `Function error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Enhanced search string generation
function generateEnhancedSearchString(text: string, type: string): string {
  // Extract all words from text
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates - case insensitive conversion
  const uniqueWords = Array.from(new Set(words.map(word => word.toLowerCase())))
    .map(lowerCaseWord => {
      // Find the original word with preserved casing
      const original = words.find(w => w.toLowerCase() === lowerCaseWord);
      return original || lowerCaseWord;
    });
  
  // Extended stopwords in multiple languages
  const stopwords = [
    // English
    "and", "the", "with", "from", "this", "that", "have", "been", "would", "there", "their",
    "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    // German
    "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das", "sie", "und", 
    "für", "auf", "ist", "sind", "oder", "als", "dann", "nach", "durch", "über", "unter",
    "auch", "wenn", "wird", "werden", "wurde", "wurden", "sein", "seine", "seinen", "seiner",
    "hat", "hatte", "hatten", "haben", "wir", "mich", "mir", "dich", "dir", "uns", "euch",
    // Common words in multiple languages that are usually not very specific
    "email", "phone", "contact", "website", "address", "info", "information", "welcome",
    "click", "service", "services", "home", "page"
  ];
  
  // Filter out stopwords and too short words (case insensitive)
  const filteredWords = uniqueWords.filter(word => 
    !stopwords.includes(word.toLowerCase()) && word.length > 3
  );
  
  // Find keywords in the text
  const keywords = findKeywords(filteredWords, type);
  
  // Take the most important words (up to 15)
  const importantWords = keywords.slice(0, 10);
  
  // Build search string based on type with proper Boolean logic
  let searchString = "";
  
  if (type === "recruiting") {
    // Add location information if it exists
    const locationTerms = findLocationInfo(text);
    const jobTitles = findJobTitles(text);
    
    // Combine job titles with AND if available
    const jobTitleString = jobTitles.length > 0 
      ? `(${jobTitles.join(" OR ")})` 
      : `(${importantWords.slice(0, 3).join(" OR ")})`;
    
    // Add recruiting-specific terms
    const recruitingTerms = `("resume" OR "CV" OR "curriculum vitae" OR "Lebenslauf" OR "Bewerbung")`;
    
    // Build the full search string
    searchString = `${jobTitleString} AND ${locationTerms.length > 0 ? `(${locationTerms.join(" OR ")}) AND ` : ""}${recruitingTerms}`;
    
    // Add some remaining important keywords if we have space
    if (importantWords.length > 3) {
      searchString += ` AND (${importantWords.slice(3, 7).join(" OR ")})`;
    }
  } else {
    // For lead generation, organize by company and industry terms
    const companyTerms = findCompanyTerms(text);
    const industryTerms = findIndustryTerms(text);
    
    // Build blocks for the search string
    const companyBlock = companyTerms.length > 0 
      ? `(${companyTerms.join(" OR ")})` 
      : `(${importantWords.slice(0, 3).join(" OR ")})`;
      
    const industryBlock = industryTerms.length > 0
      ? ` AND (${industryTerms.join(" OR ")})`
      : ` AND (${importantWords.slice(3, 6).join(" OR ")})`;
      
    const leadGenTerms = ` AND ("company" OR "business" OR "enterprise" OR "Unternehmen" OR "Firma" OR "Betrieb")`;
    
    // Build the full search string
    searchString = companyBlock + industryBlock + leadGenTerms;
    
    // Add some remaining important keywords if we have space
    if (importantWords.length > 6) {
      searchString += ` AND (${importantWords.slice(6, 10).join(" OR ")})`;
    }
  }
  
  return searchString;
}

// Helper functions for keyword extraction

function findKeywords(words: string[], type: string): string[] {
  // Rank words by potential importance
  return words.sort((a, b) => {
    // Prioritize capitalized words (proper nouns)
    const aIsCapitalized = a.charAt(0) === a.charAt(0).toUpperCase();
    const bIsCapitalized = b.charAt(0) === b.charAt(0).toUpperCase();
    
    if (aIsCapitalized && !bIsCapitalized) return -1;
    if (!aIsCapitalized && bIsCapitalized) return 1;
    
    // Then by length (longer words are often more specific)
    return b.length - a.length;
  });
}

function findLocationInfo(text: string): string[] {
  // Simple location extraction based on common patterns
  const locationPatterns = [
    /\b(?:in|at|near|around)\s+([A-Z][a-zäöüß]+(?:\s+[A-Z][a-zäöüß]+)?)\b/g,
    /\b([A-Z][a-zäöüß]+(?:\s+[A-Z][a-zäöüß]+)?),\s+(?:Germany|Deutschland|Berlin|Hamburg|Munich|Köln|Frankfurt|Stuttgart)\b/g,
    /\b(Berlin|Hamburg|Munich|München|Köln|Cologne|Frankfurt|Stuttgart|Düsseldorf|Dresden|Leipzig|Hannover|Nürnberg|Nuremberg)\b/g
  ];
  
  const locations = new Set<string>();
  
  for (const pattern of locationPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) locations.add(match[1]);
    }
  }
  
  return Array.from(locations);
}

function findJobTitles(text: string): string[] {
  // Common job title patterns and keywords
  const jobTitlePatterns = [
    /\b(Software Engineer|Developer|Programmer|Designer|Manager|Director|Consultant|Analyst|Specialist|Expert|Coordinator|Administrator|Assistant|Officer|Technician|Engineer|Accountant|Finanzexperte|Buchhalter)\b/g,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:position|role|job|vacancy|stelle|position)\b/gi
  ];
  
  const jobTitles = new Set<string>();
  
  for (const pattern of jobTitlePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) jobTitles.add(match[1]);
    }
  }
  
  // Add the specific job title from the input if it appears to be there
  if (text.toLowerCase().includes("finanzbuchhalter")) {
    jobTitles.add("Finanzbuchhalter");
  }
  
  return Array.from(jobTitles);
}

function findCompanyTerms(text: string): string[] {
  // Extract company-related terms
  const companyPatterns = [
    /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:GmbH|AG|SE|KG|OHG|Co\.|Inc\.|Corp\.|LLC|Ltd\.)\b/g,
    /\b([A-Z][a-zA-Z0-9]+)\b(?=.*\bcompany\b|.*\bfirma\b|.*\bunternehmen\b)/gi
  ];
  
  const companyTerms = new Set<string>();
  
  for (const pattern of companyPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) companyTerms.add(match[1]);
    }
  }
  
  return Array.from(companyTerms);
}

function findIndustryTerms(text: string): string[] {
  // Common industry keywords
  const industryKeywords = [
    "Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", 
    "Consulting", "Media", "Marketing", "Automotive", "Aerospace", "Pharmaceuticals",
    "Technologie", "Finanzen", "Gesundheitswesen", "Bildung", "Fertigung", "Einzelhandel",
    "Beratung", "Medien", "Marketing", "Automobil", "Luft- und Raumfahrt", "Pharmazeutika"
  ];
  
  const foundIndustries = industryKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return foundIndustries;
}
