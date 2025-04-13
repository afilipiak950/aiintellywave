import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const body = await req.json();
    const { 
      search_string_id,
      type, 
      input_text, 
      input_url, 
      input_source, 
      company_id,
      user_id
    } = body;
    
    if (!search_string_id) {
      throw new Error("Search string ID is required");
    }
    
    console.log(`Processing search string: ${search_string_id} of type ${type} from ${input_source}`);
    
    // Update status to processing if not already
    const { error: updateError } = await supabase
      .from('search_strings')
      .update({ status: 'processing' })
      .eq('id', search_string_id);
      
    if (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    let contextData = "";
    
    // Prepare context data based on input source
    if (input_source === "text") {
      contextData = input_text || "";
      console.log("Text input data:", contextData);
    } else if (input_source === "website" && input_url) {
      try {
        // Fetch website content using improved crawler functionality
        console.log("Fetching website content from:", input_url);
        
        // Make sure URL has protocol
        const urlWithProtocol = input_url.startsWith('http') ? input_url : `https://${input_url}`;
        
        // Fetch the webpage content
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout
        
        const response = await fetch(urlWithProtocol, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; SearchStringBot/1.0)'
          },
          signal: controller.signal
        }).finally(() => clearTimeout(timeout));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        
        // Get content type to ensure we're dealing with HTML
        const contentType = response.headers.get('Content-Type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
          throw new Error(`Invalid content type: ${contentType}. Expected HTML.`);
        }
        
        // Get the HTML content
        const html = await response.text();
        console.log(`Received HTML content, length: ${html.length} characters`);
        
        // Extract text content from HTML
        contextData = extractTextFromHtml(html);
        console.log("Website content extracted, length:", contextData.length);
        console.log("First 200 chars of extracted content:", contextData.substring(0, 200));
        
        // If extracted content is too short, try to fetch linked pages
        if (contextData.length < 1000 && urlWithProtocol.includes('/jobs/') && !urlWithProtocol.includes('?')) {
          console.log("Job content seems too short, attempting to find more content on linked pages");
          
          // Extract other job links
          const jobLinks = extractJobLinks(html, urlWithProtocol);
          console.log(`Found ${jobLinks.length} potential job links to explore`);
          
          // Try to fetch up to 3 additional job pages
          for (let i = 0; i < Math.min(3, jobLinks.length); i++) {
            try {
              console.log(`Fetching additional job page: ${jobLinks[i]}`);
              const additionalController = new AbortController();
              const additionalTimeout = setTimeout(() => additionalController.abort(), 15000);
              
              const additionalResponse = await fetch(jobLinks[i], {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; SearchStringBot/1.0)'
                },
                signal: additionalController.signal
              }).finally(() => clearTimeout(additionalTimeout));
              
              if (additionalResponse.ok) {
                const additionalHtml = await additionalResponse.text();
                const additionalText = extractTextFromHtml(additionalHtml);
                contextData += "\n\n--- ADDITIONAL JOB CONTENT ---\n" + additionalText;
                console.log(`Added ${additionalText.length} chars from linked job page`);
              }
            } catch (e) {
              console.log(`Failed to fetch additional job link: ${e.message}`);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching website:", error);
        return new Response(
          JSON.stringify({ error: `Failed to process website: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } else if (input_source === "pdf") {
      // Get the search string record to retrieve the PDF text
      const { data: stringData, error: stringError } = await supabase
        .from('search_strings')
        .select('input_text')
        .eq('id', search_string_id)
        .single();
        
      if (stringError) {
        console.error("Error retrieving search string:", stringError);
        throw new Error(`Failed to retrieve PDF text: ${stringError.message}`);
      }
      
      contextData = stringData?.input_text || "";
      console.log("PDF content extracted, length:", contextData.length);
    }
    
    // Build improved prompts based on type
    let prompt = "";
    if (type === "recruiting") {
      prompt = `
You are an expert Boolean search string creator specializing in recruitment searches. Your task is to analyze the following job description and create a comprehensive LinkedIn search string that uses Boolean logic.

JOB DESCRIPTION:
${contextData}

IMPORTANT RULES:
1. You MUST include EVERY significant word, term, and phrase from the job description
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for job titles
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. NEVER omit any part of the job description - include ALL provided information
7. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
8. For technical roles, identify ALL programming languages, frameworks, and technologies
9. If years of experience or location are mentioned, ALWAYS include them
10. Use proper German (if detecting German language) synonyms and translations where appropriate

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important requirements with AND operators
- Include experience details and company information exactly as specified
- MAKE SURE TO USE EVERY WORD FROM THE JOB DESCRIPTION in proper Boolean format`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert Boolean search string creator specializing in lead generation. Your task is to analyze the following company website content and create a comprehensive LinkedIn search string that uses Boolean logic.

WEBSITE CONTENT:
${contextData}

IMPORTANT RULES:
1. You MUST include EVERY significant word, term, and phrase from the website content
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for titles and industries
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. NEVER omit any part of the company description - include ALL provided information
7. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
8. Identify and include ALL industries, company sizes, job titles, and locations mentioned
9. Use proper German (if detecting German language) synonyms and translations where appropriate
10. Focus on decision-makers and people with purchasing authority as mentioned in the content

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important criteria with AND operators
- Include company size, revenue information, and specific industries exactly as specified by the website
- MAKE SURE TO USE EVERY SIGNIFICANT WORD FROM THE WEBSITE CONTENT in proper Boolean format`;
    }
    
    // Call OpenAI API to generate the search string
    let generatedSearchString = "";
    
    if (openAIKey) {
      try {
        console.log("Calling OpenAI API with prompt length:", prompt.length);
        const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openAIKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert at creating precise Boolean search strings that follow strict logical structure and syntax. You analyze content and generate search strings that capture all important details."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.1, // Lower temperature for more deterministic results
            max_tokens: 1500,
          }),
        });
        
        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const aiResult = await openAIResponse.json();
        generatedSearchString = aiResult.choices[0].message.content.trim();
        console.log("Generated search string:", generatedSearchString);
      } catch (openAIError) {
        console.error("Error calling OpenAI:", openAIError);
        
        // Fallback to a simple generated string
        generatedSearchString = generateBasicSearchString(contextData, type);
      }
    } else {
      console.warn("OpenAI API key not configured, using fallback generation");
      generatedSearchString = generateBasicSearchString(contextData, type);
    }
    
    // Update the search string in the database
    const { data, error } = await supabase
      .from('search_strings')
      .update({
        generated_string: generatedSearchString,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', search_string_id)
      .select();
    
    if (error) {
      console.error("Error updating search string:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        search_string: generatedSearchString,
        record: data?.[0] 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    // Update the search string status to failed
    try {
      const body = await req.json();
      const searchStringId = body.search_string_id;
      
      if (searchStringId) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('search_strings')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', searchStringId);
      }
    } catch (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Enhanced text extraction from HTML focusing on job-related content
function extractTextFromHtml(html) {
  try {
    // Remove script and style tags and their content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    
    // Prioritize job-related sections with additional weight
    const jobSections = [];
    
    // Extract content from job-specific containers (common patterns in job sites)
    const jobPatterns = [
      /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-details[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-requirements[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job-qualifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
    ];
    
    // Extract job-specific sections
    for (const pattern of jobPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1]) {
          // Remove nested HTML from the extracted section
          const sectionText = match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          if (sectionText.length > 30) {  // Only consider substantial sections
            jobSections.push("\n" + sectionText + "\n");
          }
        }
      }
    }
    
    // Extract heading content which often contains job titles and important info
    const headingMatches = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    if (headingMatches) {
      for (const heading of headingMatches) {
        const cleanHeading = heading.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanHeading && cleanHeading.length > 2) {
          jobSections.push("\n### " + cleanHeading + "\n");
        }
      }
    }
    
    // Process list items which often contain requirements and qualifications
    const listItemMatches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (listItemMatches) {
      for (const item of listItemMatches) {
        const cleanItem = item.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (cleanItem && cleanItem.length > 10) {
          jobSections.push("• " + cleanItem);
        }
      }
    }
    
    // Remove navigation, header, footer, and other non-content tags
    text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ");
    text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ");
    text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ");
    text = text.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, " ");
    
    // Process HTML tags - keep meaningful headings and paragraphs structure
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n\n### $1\n\n"); // H1 gets special formatting
    text = text.replace(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi, "\n\n## $1\n\n"); // Other headings
    text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n"); // Paragraphs end with newline
    text = text.replace(/<br[^>]*>/gi, "\n"); // Line breaks become newlines
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n"); // List items as bullets
    
    // Remove remaining HTML tags
    text = text.replace(/<[^>]*>/g, " ");
    
    // Fix HTML entities
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, "\"");
    text = text.replace(/&apos;/g, "'");
    text = text.replace(/&#\d+;/g, " ");
    
    // Normalize whitespace
    text = text.replace(/\s+/g, " ");
    
    // Fix common issues: replace multiple newlines with max two
    text = text.replace(/\n\s*\n\s*\n+/g, "\n\n");
    
    // Combine job sections with general text
    let finalText = "";
    
    // Add job sections first as they're more important
    if (jobSections.length > 0) {
      finalText += "=== JOB DETAILS ===\n" + jobSections.join("\n") + "\n\n";
    }
    
    // Add general page text
    finalText += "=== GENERAL PAGE CONTENT ===\n" + text.trim();
    
    return finalText;
  } catch (e) {
    console.error("Error extracting text from HTML:", e);
    return ""; // Return empty string on error
  }
}

// Extract job links from the HTML
function extractJobLinks(html, baseUrl) {
  try {
    const links = [];
    const seen = new Set();
    const baseUrlObj = new URL(baseUrl);
    const baseUrlHost = baseUrlObj.hostname;
    
    // Regular expression to match href attributes
    const hrefRegex = /href=["'](.*?)["']/gi;
    let match;
    
    while ((match = hrefRegex.exec(html)) !== null) {
      let url = match[1];
      
      // Skip empty URLs, anchors, javascript, and mailto links
      if (!url || url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:')) {
        continue;
      }
      
      try {
        // Convert relative URLs to absolute
        if (!url.startsWith('http')) {
          if (url.startsWith('/')) {
            url = `${baseUrlObj.protocol}//${baseUrlHost}${url}`;
          } else {
            const basePath = baseUrlObj.pathname.split('/').slice(0, -1).join('/') + '/';
            url = `${baseUrlObj.protocol}//${baseUrlHost}${basePath}${url}`;
          }
        }
        
        const urlObj = new URL(url);
        
        // Only keep links from the same domain and those that look like job postings
        if (urlObj.hostname === baseUrlHost && 
            !seen.has(url) && 
            (url.includes('/job/') || 
             url.includes('/jobs/') || 
             url.includes('/career') || 
             url.includes('/stellenangebot') ||
             url.includes('/stellenangebote') ||
             url.includes('/position/'))) {
          links.push(url);
          seen.add(url);
          
          // Limit to 5 job links to avoid excessive crawling
          if (links.length >= 5) break;
        }
      } catch (e) {
        // Skip invalid URLs
        continue;
      }
    }
    
    return links;
  } catch (e) {
    console.error("Error extracting job links:", e);
    return [];
  }
}

// Basic search string generation as a fallback
function generateBasicSearchString(text, type) {
  // Extract all words from text
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates
  const uniqueWords = Array.from(new Set(words));
  
  // Basic stopwords
  const stopwords = ["and", "the", "with", "from", "this", "that", "have", "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das"];
  const filteredWords = uniqueWords.filter(word => !stopwords.includes(word.toLowerCase()));
  
  // Take the first 20 words to avoid overly complex strings
  const selectedWords = filteredWords.slice(0, 20);
  
  // Group words with OR
  const searchString = `(${selectedWords.join(" OR ")})`;
  
  // Add type-specific ending
  if (type === "recruiting") {
    return `${searchString} AND ("Resume" OR "CV")`;
  } else {
    return `${searchString} AND ("Company" OR "Business")`;
  }
}
