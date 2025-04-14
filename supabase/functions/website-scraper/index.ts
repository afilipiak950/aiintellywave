
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Scraping website: ${url}`);
    
    // Define a timeout for the fetch operation (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      // Attempt to fetch the URL with proper headers to mimic a browser
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`Unsupported content type: ${contentType}. Only HTML pages are supported.`);
      }
      
      // Get the HTML content
      const html = await response.text();
      
      if (!html || html.length < 100) {
        throw new Error('Retrieved HTML content is too small or empty');
      }
      
      console.log(`Successfully fetched HTML content, length: ${html.length}`);
      
      // Use regular expressions to extract text content
      let text = html
        // Remove script and style tags with their content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        // Convert common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, ' ');
      
      // Handle line breaks and excess whitespace
      text = text
        .replace(/(\r\n|\n|\r)/gm, ' ')  // Replace line breaks with spaces
        .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
        .trim();                         // Trim leading/trailing spaces
      
      // For job listings (like stepstone), try to extract specific sections
      if (url.includes('stepstone') || url.includes('job') || url.includes('career') || url.includes('stellenangebot')) {
        // Enhanced extraction for job listings - collect title, company, location, requirements
        const jobTitle = extractPattern(html, /<h1[^>]*>(.*?)<\/h1>/i) || 
                        extractPattern(html, /<title[^>]*>(.*?)<\/title>/i);
        
        const companyName = extractPattern(html, /company-name[^>]*>(.*?)<\/|data-company[^>]*>(.*?)<\/|company[^>]*>(.*?)<\//i) ||
                           extractPattern(html, /(?:firm|employer|company)(?:[^>]+)>(.*?)<\//i);
        
        const location = extractPattern(html, /location[^>]*>(.*?)<\/|address[^>]*>(.*?)<\/|city[^>]*>(.*?)<\//i) ||
                         extractPattern(html, /(?:standort|ort|place)(?:[^>]+)>(.*?)<\//i);
        
        // Try to extract job description or requirements sections
        const jobDescription = extractPattern(html, /job-description[^>]*>(.*?)<\/section|job-description[^>]*>(.*?)<div/is) ||
                              extractPattern(html, /description[^>]*>(.*?)<\/section|description[^>]*>(.*?)<div/is) ||
                              extractPattern(html, /aufgaben[^>]*>(.*?)<\/section|aufgaben[^>]*>(.*?)<div/is);
        
        const requirements = extractPattern(html, /requirements[^>]*>(.*?)<\/section|requirements[^>]*>(.*?)<div/is) ||
                            extractPattern(html, /qualifications[^>]*>(.*?)<\/section|qualifications[^>]*>(.*?)<div/is) ||
                            extractPattern(html, /qualifikationen[^>]*>(.*?)<\/section|anforderungen[^>]*>(.*?)<div/is);
        
        // Add structured data to the beginning of the extracted text
        const structuredInfo = [
          jobTitle ? `Job Title: ${cleanText(jobTitle)}` : '',
          companyName ? `Company: ${cleanText(companyName)}` : '',
          location ? `Location: ${cleanText(location)}` : '',
          jobDescription ? `Job Description: ${cleanText(jobDescription)}` : '',
          requirements ? `Requirements: ${cleanText(requirements)}` : ''
        ].filter(Boolean).join('\n\n');
        
        // If we found structured data, prepend it to the text
        if (structuredInfo.length > 20) {
          text = `${structuredInfo}\n\n${text}`;
          console.log("Added structured job data extraction");
        }
      }
      
      console.log(`Extracted text content, length: ${text.length}`);
      
      // If text is too short after extraction, it might be a JavaScript-heavy page
      if (text.length < 200) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Not enough text content extracted. The page might be JavaScript-heavy or protected against scraping.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error fetching URL:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ success: false, error: 'Request timed out after 30 seconds' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch URL: ${fetchError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to extract content using a pattern
function extractPattern(html: string, pattern: RegExp): string | null {
  const match = html.match(pattern);
  if (match) {
    // Return the first capturing group that has content
    for (let i = 1; i < match.length; i++) {
      if (match[i]) return match[i];
    }
  }
  return null;
}

// Helper to clean extracted text
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')  // Remove any HTML tags
    .replace(/&nbsp;/g, ' ')   // Convert common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')      // Replace multiple spaces with a single space
    .trim();                   // Trim leading/trailing spaces
}
