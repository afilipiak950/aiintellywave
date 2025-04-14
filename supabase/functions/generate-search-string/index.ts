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
      .update({ 
        status: 'processing',
        progress: 5, // Add initial progress indicator
      })
      .eq('id', search_string_id);
      
    if (updateError) {
      console.error("Error updating search string status:", updateError);
    }
    
    let contextData = "";
    
    // Prepare context data based on input source
    if (input_source === "text") {
      contextData = input_text || "";
      console.log("Text input data:", contextData);
      
      // Update progress
      await supabase
        .from('search_strings')
        .update({ progress: 50 })
        .eq('id', search_string_id);
    } else if (input_source === "website" && input_url) {
      try {
        // Update progress - starting web crawl
        await supabase
          .from('search_strings')
          .update({ progress: 10 })
          .eq('id', search_string_id);
          
        console.log("Fetching website content from:", input_url);
        
        // Make sure URL has protocol
        const urlWithProtocol = input_url.startsWith('http') ? input_url : `https://${input_url}`;
        
        // Update progress - starting actual fetch
        await supabase
          .from('search_strings')
          .update({ progress: 15 })
          .eq('id', search_string_id);
        
        // Enhanced crawler with fallback mechanisms
        let html = "";
        let fetchSuccess = false;
        
        // Try multiple user agents to bypass anti-bot protections
        const userAgents = [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
          'Mozilla/5.0 (compatible; SearchStringBot/1.0)',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36'
        ];
        
        for (let i = 0; i < userAgents.length; i++) {
          if (fetchSuccess) break;
          
          try {
            console.log(`Attempt ${i+1} with user agent: ${userAgents[i].substring(0, 20)}...`);
            
            // Set a timeout for fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
            
            const response = await fetch(urlWithProtocol, {
              headers: {
                'User-Agent': userAgents[i],
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache'
              },
              signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            
            if (response.ok) {
              html = await response.text();
              
              // Check if we got actual HTML content
              if (html.includes('<html') && html.includes('<body')) {
                fetchSuccess = true;
                console.log(`Successful fetch with user agent ${i+1}, HTML length: ${html.length}`);
                
                // Update progress
                await supabase
                  .from('search_strings')
                  .update({ progress: 25 })
                  .eq('id', search_string_id);
              } else {
                console.warn("Response was OK but didn't contain valid HTML");
              }
            } else {
              console.warn(`Failed with user agent ${i+1}: ${response.status} ${response.statusText}`);
            }
          } catch (fetchError) {
            console.warn(`Fetch error with user agent ${i+1}:`, fetchError.message);
          }
        }
        
        if (!fetchSuccess) {
          // Try one more approach specifically for job sites
          try {
            console.log("Trying with special approach for job sites...");
            
            // Use a headless-browser-like approach with proper headers
            const response = await fetch(urlWithProtocol, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
                'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="96", "Chromium";v="96"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache'
              }
            });
            
            if (response.ok) {
              html = await response.text();
              
              // Check if we got actual HTML content
              if (html.includes('<html') && html.includes('<body')) {
                fetchSuccess = true;
                console.log("Successful fetch with special approach, HTML length:", html.length);
                
                // Update progress
                await supabase
                  .from('search_strings')
                  .update({ progress: 25 })
                  .eq('id', search_string_id);
              }
            }
          } catch (specialError) {
            console.warn("Special approach failed:", specialError.message);
          }
        }
        
        if (!fetchSuccess || !html) {
          throw new Error("Failed to fetch website content after multiple attempts");
        }
        
        // Extract text content
        console.log("Extracting text from HTML...");
        contextData = enhancedExtractTextFromHtml(html, urlWithProtocol);
        console.log("Text extracted, length:", contextData.length);
        
        // Update progress
        await supabase
          .from('search_strings')
          .update({ progress: 40 })
          .eq('id', search_string_id);
          
        // If the extracted content is very short, it might be protected
        // Try to look for specific job details
        if (contextData.length < 500 && (input_url.includes('stellenangebot') || input_url.includes('job'))) {
          console.log("Extracted content is suspiciously short, trying to find job details...");
          
          // Look for job details sections
          const jobDetailsMatch = html.match(/<div[^>]*class="[^"]*job-details[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                                html.match(/<div[^>]*class="[^"]*jobad[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                                html.match(/<section[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/section>/i);
                                
          if (jobDetailsMatch && jobDetailsMatch[1]) {
            const jobDetailText = enhancedExtractTextFromHtml(jobDetailsMatch[1], urlWithProtocol);
            console.log("Found specific job details section, length:", jobDetailText.length);
            
            if (jobDetailText.length > 100) {
              contextData = jobDetailText;
              console.log("Using job details text instead");
            }
          }
          
          // Try to extract structured job data (many sites use this)
          const structuredDataMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
          if (structuredDataMatch && structuredDataMatch[1]) {
            try {
              const structuredData = JSON.parse(structuredDataMatch[1].trim());
              console.log("Found structured job data:", Object.keys(structuredData));
              
              if (structuredData.jobDescription) {
                contextData += "\n\n=== STRUCTURED JOB DATA ===\n" + structuredData.jobDescription;
                if (structuredData.title) contextData += "\nTitle: " + structuredData.title;
                if (structuredData.employmentType) contextData += "\nEmployment Type: " + structuredData.employmentType;
                if (structuredData.hiringOrganization?.name) contextData += "\nCompany: " + structuredData.hiringOrganization.name;
                console.log("Added structured job data, new length:", contextData.length);
              }
            } catch (jsonError) {
              console.warn("Failed to parse structured data:", jsonError.message);
            }
          }
        }
        
        // Update progress - finished extracting
        await supabase
          .from('search_strings')
          .update({ progress: 50 })
          .eq('id', search_string_id);
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
        .maybeSingle();
        
      if (stringError) {
        console.error("Error retrieving search string:", stringError);
        throw new Error(`Failed to retrieve PDF text: ${stringError.message}`);
      }
      
      contextData = stringData?.input_text || "";
      console.log("PDF content extracted, length:", contextData.length);
      
      // Update progress
      await supabase
        .from('search_strings')
        .update({ progress: 50 })
        .eq('id', search_string_id);
    }
    
    // Update progress - starting AI generation
    await supabase
      .from('search_strings')
      .update({ progress: 60 })
      .eq('id', search_string_id);
    
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
    
    // Update progress - prompt prepared
    await supabase
      .from('search_strings')
      .update({ progress: 70 })
      .eq('id', search_string_id);
    
    // Call OpenAI API to generate the search string
    let generatedSearchString = "";
    
    if (openAIKey) {
      try {
        console.log("Calling OpenAI API with prompt length:", prompt.length);
        
        // Update progress - calling AI
        await supabase
          .from('search_strings')
          .update({ progress: 75 })
          .eq('id', search_string_id);
        
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
        
        // Update progress - AI processing
        await supabase
          .from('search_strings')
          .update({ progress: 85 })
          .eq('id', search_string_id);
        
        if (!openAIResponse.ok) {
          const errorData = await openAIResponse.json();
          console.error("OpenAI API error:", errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const aiResult = await openAIResponse.json();
        generatedSearchString = aiResult.choices[0].message.content.trim();
        console.log("Generated search string:", generatedSearchString);
        
        // Update progress - AI completed
        await supabase
          .from('search_strings')
          .update({ progress: 95 })
          .eq('id', search_string_id);
      } catch (openAIError) {
        console.error("Error calling OpenAI:", openAIError);
        
        // Handle error case better - try with fallback
        if (contextData.length > 100) {
          // If we at least have some context data, try to generate a basic string
          generatedSearchString = generateBasicSearchString(contextData, type);
        } else {
          // If the crawl totally failed, provide a clear error message
          generatedSearchString = "Error: Unable to extract sufficient content from the provided URL. " +
            "The website may be using protection against automated access. " +
            "Please try using the text input method instead and paste the job description manually.";
          
          throw new Error("Failed to extract content and generate search string");
        }
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
        progress: 100,
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
function enhancedExtractTextFromHtml(html, url) {
  try {
    // Prioritize job-related sections with additional weight
    const jobSections = [];
    let hasFoundJobContent = false;
    
    // Check for common job sites and use special extraction
    if (url.includes('stepstone.de') || url.includes('linkedin.com/jobs') || url.includes('indeed.com') || url.includes('monster')) {
      console.log("Detected job site, using specialized extraction");
      
      // Extract content from job-specific containers (common patterns in job sites)
      const jobPatterns = [
        /<div[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*jobDescription[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*job-details[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*job-requirements[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*job-qualifications[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*id="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*id="[^"]*jobDescription[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<section[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
        /<article[^>]*class="[^"]*job[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
        /<div[^>]*class="[^"]*stellenangebot[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*stelle[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*class="[^"]*jobad[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        /<div[^>]*data-job[^>]*>([\s\S]*?)<\/div>/gi
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
              hasFoundJobContent = true;
            }
          }
        }
      }
    }
    
    // Extract specific sections that are likely to contain job details
    const specificSections = [];
    
    // These selectors are common in job descriptions
    const specificPatterns = [
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<main[^>]*>([\s\S]*?)<\/main>/gi
    ];
    
    for (const pattern of specificPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        if (match[1] && match[1].length > 100) {
          const sectionText = match[1].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
                                     .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
          specificSections.push(sectionText);
        }
      }
    }
    
    // Remove script and style tags and their content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
    
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
    
    // Combine all extracted parts
    let finalText = "";
    
    // If we've found specific job sections, prioritize them
    if (hasFoundJobContent && jobSections.length > 0) {
      finalText += "=== JOB DETAILS ===\n" + jobSections.join("\n") + "\n\n";
    } 
    // If we've found main content sections but no job sections, use those
    else if (specificSections.length > 0) {
      const processedSpecificText = specificSections[0].replace(/<[^>]*>/g, " ")
                                                     .replace(/\s+/g, " ")
                                                     .trim();
      finalText += "=== MAIN CONTENT ===\n" + processedSpecificText + "\n\n";
    }
    
    // Add general page text if we don't have much content yet
    if (finalText.length < 500) {
      finalText += "=== GENERAL PAGE CONTENT ===\n" + text.trim();
    }
    
    return finalText;
  } catch (e) {
    console.error("Error extracting text from HTML:", e);
    return "Error extracting content from the webpage."; // Return error message on failure
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
