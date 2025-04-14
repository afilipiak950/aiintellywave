import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching content from: ${url}`);
    
    // Ensure URL has protocol
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      // Fetch with timeout and browser-like headers
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
        },
      }).finally(() => clearTimeout(timeout));
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      
      // Check content type to make sure it's HTML
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        throw new Error(`URL does not appear to be an HTML page: ${contentType}`);
      }
      
      const html = await response.text();
      
      console.log(`Successfully fetched HTML content, length: ${html.length}`);
      
      // Extract text from HTML
      const extractedText = extractTextFromHtml(html);
      
      console.log(`Extracted text, length: ${extractedText.length}`);
      
      // Try to extract the domain for better context
      let domain = '';
      try {
        domain = new URL(targetUrl).hostname;
      } catch (e) {
        console.error('Error parsing URL domain:', e);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          text: extractedText,
          domain,
          url: targetUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching URL: ${fetchError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Server error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Improved text extraction from HTML
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Remove common non-content sections
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
  text = text.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, " ");
  text = text.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, " ");
  
  // Process HTML tags to keep some structure
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n$1\n\n"); 
  text = text.replace(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi, "\n\n$1\n\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n");
  text = text.replace(/<br[^>]*>/gi, "\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");
  text = text.replace(/<dt[^>]*>(.*?)<\/dt>/gi, "\n$1: ");
  text = text.replace(/<dd[^>]*>(.*?)<\/dd>/gi, "$1\n");
  
  // Process important semantic elements
  text = text.replace(/<article[^>]*>(.*?)<\/article>/gi, "\n$1\n");
  text = text.replace(/<section[^>]*>(.*?)<\/section>/gi, "\n$1\n");
  text = text.replace(/<div[^>]*>(.*?)<\/div>/gi, "$1 ");
  
  // Try to capture text in span elements
  text = text.replace(/<span[^>]*>(.*?)<\/span>/gi, "$1 ");
  
  // Try to extract alt text from images as it can contain valuable information
  const altTextRegex = /<img[^>]*alt=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = altTextRegex.exec(html)) !== null) {
    if (match[1] && match[1].length > 5) {  // Only use substantial alt text
      text += " " + match[1];
    }
  }
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ");
  
  // Fix HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, "\"");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  text = text.replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
  
  return text.trim();
}
