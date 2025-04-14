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
          'Accept-Language': 'en-US,en;q=0.9',
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
      
      // Simple text extraction - remove HTML tags and normalize whitespace
      const extractedText = extractTextFromHtml(html);
      
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

// Simple text extraction from HTML without dependencies
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Remove navigation, header, footer, and other non-content tags
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
  
  // Process HTML tags to keep some structure
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n$1\n\n"); 
  text = text.replace(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi, "\n\n$1\n\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n");
  text = text.replace(/<br[^>]*>/gi, "\n");
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ");
  
  // Fix HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, "\"");
  text = text.replace(/&apos;/g, "'");
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
  
  return text.trim();
}
