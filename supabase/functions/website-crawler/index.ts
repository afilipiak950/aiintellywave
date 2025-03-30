
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI API key from environment variables
const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

// Function to fetch and parse website content
async function crawlWebsite(url: string, maxPages: number = 20, maxDepth: number = 2) {
  console.log(`Starting crawl of ${url} with maxPages=${maxPages}, maxDepth=${maxDepth}`);
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  try {
    // Parse base domain to stay within same site
    const baseUrl = new URL(url);
    const domain = baseUrl.hostname;
    console.log(`Base domain: ${domain}`);
    
    // Track visited URLs and pages to crawl
    const visited = new Set<string>();
    const toVisit: { url: string; depth: number }[] = [{ url, depth: 0 }];
    let pageCount = 0;
    let textContent = "";
    
    // Process pages until we reach limits
    while (toVisit.length > 0 && pageCount < maxPages) {
      const current = toVisit.shift();
      if (!current) continue;
      
      const { url: currentUrl, depth } = current;
      
      // Skip if already visited or over depth limit
      if (visited.has(currentUrl) || depth > maxDepth) continue;
      
      console.log(`Crawling ${currentUrl} (depth ${depth})`);
      visited.add(currentUrl);
      pageCount++;
      
      try {
        // Fetch page content
        const response = await fetch(currentUrl);
        
        if (response.status !== 200) {
          console.log(`Failed to fetch ${currentUrl}: ${response.status}`);
          continue;
        }
        
        // Extract text content
        const html = await response.text();
        const plainText = extractTextFromHtml(html);
        textContent += `\n\n--- PAGE: ${currentUrl} ---\n${plainText}`;
        
        // Only extract new links if we're not at max depth
        if (depth < maxDepth) {
          const links = extractLinks(html, domain, currentUrl);
          
          for (const link of links) {
            if (!visited.has(link) && !toVisit.some(item => item.url === link)) {
              toVisit.push({ url: link, depth: depth + 1 });
            }
          }
        }
        
      } catch (error) {
        console.log(`Error fetching ${currentUrl}: ${error.message}`);
      }
    }
    
    console.log(`Crawl complete: ${pageCount} pages processed`);
    return { 
      success: true, 
      textContent, 
      pageCount,
      domain 
    };
  } catch (error) {
    console.error(`Crawl failed: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Simple HTML text extraction
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Remove HTML tags and decode entities
  text = text.replace(/<[^>]*>/g, " ");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, "\"");
  
  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  
  return text.trim();
}

// Extract links from HTML that belong to the same domain
function extractLinks(html: string, domain: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const url = new URL(match[1]);
      // Only include links from the same domain
      if (url.hostname === domain) {
        links.push(url.href);
      }
    } catch (e) {
      // Skip invalid URLs
    }
  }
  
  // Also try relative URLs
  const relLinkRegex = /href=["'](\/[^"']+)["']/g;
  while ((match = relLinkRegex.exec(html)) !== null) {
    try {
      const base = new URL(baseUrl);
      const fullUrl = `${base.protocol}//${base.hostname}${match[1]}`;
      links.push(fullUrl);
    } catch (e) {
      // Skip invalid URLs
    }
  }
  
  return links;
}

// Process document content
function processDocumentContent(documents: any[]): string {
  let textContent = "\n\n--- UPLOADED DOCUMENTS ---\n";
  
  documents.forEach((doc, index) => {
    textContent += `\n\n--- DOCUMENT ${index + 1}: ${doc.name} ---\n${doc.content}`;
  });
  
  return textContent;
}

// Generate summary and FAQs using OpenAI
async function generateContentWithOpenAI(textContent: string, domain: string): Promise<{ summary: string; faqs: any[] }> {
  console.log(`Generating summary for ${domain} with OpenAI`);
  
  try {
    // Truncate text if it's too long (OpenAI has context limits)
    const maxLength = 32000; // Safe limit for context window
    const truncatedText = textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "... [content truncated due to length]" 
      : textContent;
    
    // Generate summary
    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional content summarizer. Create a thorough, well-structured summary of the website content provided. Focus on company details, mission, products/services, and any other relevant information. Organize the summary into clear sections with headings."
          },
          {
            role: "user",
            content: `Summarize this content${domain ? ` from ${domain}` : ''}:\n\n${truncatedText}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })
    });
    
    const summaryResult = await summaryResponse.json();
    
    if (!summaryResult.choices || summaryResult.choices.length === 0) {
      throw new Error("Failed to generate summary: " + JSON.stringify(summaryResult));
    }
    
    const summary = summaryResult.choices[0].message.content;
    
    // Generate FAQs
    console.log("Generating FAQs");
    const faqResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a professional FAQ generator. Generate 100 frequently asked questions and answers about the content provided${domain ? ` from ${domain}` : ''}. Group the questions by category (e.g., 'Company Information', 'Products', 'Services', 'Pricing', etc.). Format your response as a JSON array of objects, each with 'id', 'question', 'answer', and 'category' fields.`
          },
          {
            role: "user",
            content: `Based on this content${domain ? ` from ${domain}` : ''}:\n\n${truncatedText}\n\nGenerate 100 FAQs in proper JSON format.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })
    });
    
    const faqResult = await faqResponse.json();
    
    if (!faqResult.choices || faqResult.choices.length === 0) {
      throw new Error("Failed to generate FAQs: " + JSON.stringify(faqResult));
    }
    
    let faqs = [];
    try {
      const faqContent = faqResult.choices[0].message.content;
      const parsedContent = JSON.parse(faqContent);
      faqs = parsedContent.faqs || [];
      
      // Ensure we have FAQ objects with the expected structure
      faqs = faqs.map((faq, index) => ({
        id: faq.id || `faq-${index + 1}`,
        question: faq.question || `Question ${index + 1}`,
        answer: faq.answer || "No answer provided",
        category: faq.category || "General"
      }));
      
    } catch (e) {
      console.error("Error parsing FAQs JSON:", e);
      faqs = [];
    }
    
    return {
      summary,
      faqs
    };
  } catch (error) {
    console.error(`OpenAI API error: ${error.message}`);
    throw error;
  }
}

// Update job status in the database
async function updateJobStatus(jobId: string, status: 'processing' | 'completed' | 'failed', data: any = {}) {
  try {
    const { error } = await supabaseFunctionClient()
      .from('ai_training_jobs')
      .upsert({
        jobId,
        status,
        updatedAt: new Date().toISOString(),
        ...data
      });
      
    if (error) {
      console.error(`Error updating job status: ${error.message}`);
    }
  } catch (error) {
    console.error(`Failed to update job status: ${error.message}`);
  }
}

// Create Supabase client for background job
function supabaseFunctionClient() {
  return supabaseClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
  );
}

// Import Supabase JS client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

function supabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options = {}
) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    ...options
  });
}

// Process job in the background
async function processJobInBackground(jobId: string, url: string, maxPages: number, maxDepth: number, documents: any[] = []) {
  console.log(`Starting background job ${jobId} for ${url}`);
  
  try {
    // Create initial job entry
    await updateJobStatus(jobId, 'processing', { 
      url,
      progress: 10,
      createdAt: new Date().toISOString()
    });
    
    let textContent = "";
    let pageCount = 0;
    let domain = "";
    
    // If URL is provided, crawl the website
    if (url) {
      const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
      
      if (!crawlResult.success) {
        await updateJobStatus(jobId, 'failed', { error: crawlResult.error });
        return;
      }
      
      textContent = crawlResult.textContent;
      pageCount = crawlResult.pageCount;
      domain = crawlResult.domain;
      
      await updateJobStatus(jobId, 'processing', { 
        progress: 40,
        pageCount,
        domain
      });
    }
    
    // Process any uploaded documents
    if (documents && documents.length > 0) {
      console.log(`Processing ${documents.length} uploaded documents`);
      const documentContent = processDocumentContent(documents);
      textContent += documentContent;
      
      await updateJobStatus(jobId, 'processing', { 
        progress: 60
      });
    }
    
    if (!textContent) {
      await updateJobStatus(jobId, 'failed', { 
        error: "No content to analyze. Please provide a URL or upload documents."
      });
      return;
    }
    
    // Generate summary and FAQs
    console.log(`Generating content for job ${jobId}`);
    const { summary, faqs } = await generateContentWithOpenAI(textContent, domain);
    
    // Update job with completed status and results
    await updateJobStatus(jobId, 'completed', {
      summary,
      faqs,
      pageCount,
      domain,
      progress: 100
    });
    
    console.log(`Background job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error in background job ${jobId}: ${error.message}`);
    await updateJobStatus(jobId, 'failed', { error: error.message });
  }
}

// Main handler for the edge function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const {
      jobId,
      url,
      maxPages = 20,
      maxDepth = 2,
      documents = [],
      background = false
    } = await req.json();
    
    // Validate input - either URL or documents should be provided
    if (!url && (!documents || documents.length === 0)) {
      return new Response(
        JSON.stringify({ success: false, error: "Either URL or documents must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check for OpenAI API key
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "OpenAI API key is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (background && jobId) {
      // Process in background mode
      console.log(`Starting background job: ${jobId}`);
      
      // Use EdgeRuntime.waitUntil to process in the background
      // This allows the function to return immediately while processing continues
      (Deno as any).core.opAsync(
        "op_spawn_wait_until", 
        Promise.resolve().then(() => {
          processJobInBackground(jobId, url, maxPages, maxDepth, documents);
        })
      );
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Job started in the background",
          jobId
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      // Synchronous processing (original behavior)
      // Step 1: Crawl the website if URL is provided
      let textContent = "";
      let pageCount = 0;
      let domain = "";
      
      if (url) {
        console.log(`Crawling website: ${url}`);
        const crawlResult = await crawlWebsite(url, maxPages, maxDepth);
        
        if (!crawlResult.success) {
          return new Response(
            JSON.stringify({ success: false, error: crawlResult.error }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        textContent = crawlResult.textContent;
        pageCount = crawlResult.pageCount;
        domain = crawlResult.domain;
      }
      
      // Step 2: Process any uploaded documents
      if (documents && documents.length > 0) {
        console.log(`Processing ${documents.length} uploaded documents`);
        const documentContent = processDocumentContent(documents);
        textContent += documentContent;
      }
      
      if (!textContent) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "No content to analyze. Please provide a URL or upload documents." 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Step 3: Generate summary and FAQs with OpenAI
      console.log(`Generating content with OpenAI${domain ? ` for ${domain}` : ''}`);
      const { summary, faqs } = await generateContentWithOpenAI(
        textContent, 
        domain
      );
      
      // Return successful response
      return new Response(
        JSON.stringify({
          success: true,
          summary,
          faqs,
          pageCount,
          domain
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json"
          } 
        }
      );
    }
  } catch (error) {
    console.error(`Error in edge function: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
