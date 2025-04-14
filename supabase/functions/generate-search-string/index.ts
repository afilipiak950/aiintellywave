
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
        
        // Call the website-crawler function to extract content
        const crawlerResponse = await supabase.functions.invoke('website-crawler', {
          body: {
            url: input_url,
            maxPages: 10,
            maxDepth: 3,
            documents: []
          }
        });
        
        if (crawlerResponse.error) {
          throw new Error(`Website crawler error: ${crawlerResponse.error.message}`);
        }
        
        if (!crawlerResponse.data.success) {
          throw new Error(crawlerResponse.data.error || "Failed to crawl website");
        }
        
        contextData = crawlerResponse.data.textContent || "";
        console.log(`Crawler extracted ${contextData.length} characters of content from ${crawlerResponse.data.pageCount} pages`);
        
        // Save the extracted text to the database for reference
        await supabase
          .from('search_strings')
          .update({ 
            input_text: contextData.substring(0, 10000), // Store the first 10K chars of extracted text
            progress: 50
          })
          .eq('id', search_string_id);
          
        if (contextData.length < 100) {
          throw new Error("Not enough content extracted from website. Please try another URL or use text input.");
        }
      } catch (error) {
        console.error("Error extracting website content:", error);
        
        // Try a direct fetch as last resort
        try {
          console.log("Attempting direct fetch of URL as fallback:", input_url);
          const urlWithProtocol = input_url.startsWith('http') ? input_url : `https://${input_url}`;
          
          const response = await fetch(urlWithProtocol, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'Accept-Language': 'en-US,en;q=0.9,de;q=0.8'
            }
          });
          
          if (response.ok) {
            const html = await response.text();
            
            // Extract plain text from HTML
            contextData = html
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
              .replace(/<[^>]*>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
              
            // Update the database with the fallback extracted text
            await supabase
              .from('search_strings')
              .update({ 
                input_text: contextData.substring(0, 10000),
                progress: 50
              })
              .eq('id', search_string_id);
              
            console.log("Fallback extraction successful, length:", contextData.length);
          } else {
            throw new Error(`Fallback fetch failed with status: ${response.status}`);
          }
        } catch (fallbackError) {
          console.error("Fallback extraction failed:", fallbackError);
          throw new Error("Failed to extract website content after multiple attempts. Please try another URL or use text input.");
        }
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
1. You MUST include the most important skills, requirements, and job title from the job description
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for job titles
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
7. For technical roles, identify ALL programming languages, frameworks, and technologies
8. If years of experience or location are mentioned, ALWAYS include them
9. Use proper German (if detecting German language) synonyms and translations where appropriate

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important requirements with AND operators
- Include experience details and company information exactly as specified
- Keep the search string under 2000 characters (LinkedIn's limit)
- Focus on extracting the following categories: job title, skills, experience level, technologies, and location`;
    } else if (type === "lead_generation") {
      prompt = `
You are an expert Boolean search string creator specializing in lead generation. Your task is to analyze the following company website content and create a comprehensive LinkedIn search string that uses Boolean logic.

WEBSITE CONTENT:
${contextData}

IMPORTANT RULES:
1. You MUST identify and include the most important terms related to the company's industry, products, services
2. Use proper Boolean operators: AND, OR, NOT (in ALL CAPS)
3. Group related terms with parentheses for proper logic
4. Use double quotes around exact phrases, especially for titles and industries
5. Analyze the language (English, German, etc.) and adapt search terms accordingly
6. Structure the search string with OR operators within related term groups, connecting these groups with AND operators
7. Identify and include key industries, company sizes, job titles, and locations mentioned
8. Use proper German (if detecting German language) synonyms and translations where appropriate
9. Focus on decision-makers and people with purchasing authority as indicated by the content

ADDITIONAL INSTRUCTIONS:
- The search string must be READY-TO-USE with NO explanations
- Make the search specific and comprehensive
- PRIORITIZE the most important criteria with AND operators
- Include company size, revenue information, and specific industries you can identify
- Keep the search string under 2000 characters (LinkedIn's limit)
- Focus on extracting the following categories: industry, job titles, company type, products/services, and location`;
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
        
        // If OpenAI fails, try to create a basic search string instead
        try {
          generatedSearchString = generateBasicSearchString(contextData, type);
          console.log("Generated fallback search string:", generatedSearchString);
        } catch (fallbackError) {
          console.error("Error generating fallback search string:", fallbackError);
          throw new Error("Failed to generate search string. Please try again later.");
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

// Basic search string generation as a fallback
function generateBasicSearchString(text: string, type: string): string {
  // Extract all words from text
  const words = text.split(/[\s,.;:]+/).filter(word => word.length > 3);
  
  // Remove duplicates
  const uniqueWords = Array.from(new Set(words));
  
  // Basic stopwords
  const stopwords = [
    "and", "the", "with", "from", "this", "that", "have", "been", "would", "there", "their",
    "nicht", "eine", "einer", "einen", "einem", "ein", "der", "die", "das", "sie", "und", 
    "für", "auf", "ist", "sind", "oder", "als", "dann", "nach", "durch", "über", "unter",
    "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between",
    "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't",
    "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
    "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
    "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
    "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in",
    "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most",
    "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
    "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", 
    "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than",
    "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", 
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd",
    "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", 
    "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your",
    "yours", "yourself", "yourselves"
  ];
  
  // Filter out stopwords (case insensitive)
  const filteredWords = uniqueWords.filter(word => !stopwords.includes(word.toLowerCase()));
  
  // Find potential skills and technologies
  const techAndSkillsPatterns = [
    /java\b/i, /javascript/i, /python/i, /c\+\+/i, /react/i, /node\.?js/i, /aws/i, /docker/i,
    /kubernetes/i, /sql/i, /nosql/i, /mongo/i, /php/i, /html/i, /css/i, /bootstrap/i, /jquery/i,
    /typescript/i, /angular/i, /vue/i, /golang/i, /ruby/i, /rust/i, /scala/i, /swift/i,
    /kotlin/i, /objective-c/i, /flutter/i, /react\s?native/i, /ios/i, /android/i, /azure/i,
    /gcp/i, /google\s?cloud/i, /firebase/i, /terraform/i, /jenkins/i, /ci\/cd/i, /git/i,
    /github/i, /jira/i, /agile/i, /scrum/i, /kanban/i, /waterfall/i, /devops/i, /sre/i,
    /machine\s?learning/i, /artificial\s?intelligence/i, /ai/i, /ml/i, /data\s?science/i,
    /big\s?data/i, /hadoop/i, /spark/i, /tableau/i, /power\s?bi/i, /excel/i, /sap/i,
    /erp/i, /crm/i, /salesforce/i, /dynamics/i, /oracle/i, /mysql/i, /postgresql/i,
    /redis/i, /cassandra/i, /blockchain/i, /crypto/i, /nft/i, /web3/i, /cloud/i, /saas/i,
    /paas/i, /iaas/i, /linux/i, /unix/i, /windows/i, /rest/i, /graphql/i, /api/i,
    /microservice/i, /architect/i, /design/i, /lead/i, /senior/i, /junior/i, /entry/i,
    /intern/i, /co-op/i, /bachelor/i, /master/i, /phd/i, /degree/i, /certification/i
  ];
  
  // Find job titles
  const jobTitlePatterns = [
    /developer/i, /engineer/i, /programmer/i, /architect/i, /analyst/i, /consultant/i,
    /manager/i, /director/i, /vp/i, /chief/i, /cto/i, /cio/i, /ceo/i, /cfo/i, /coo/i,
    /president/i, /founder/i, /co-founder/i, /owner/i, /specialist/i, /professional/i,
    /technician/i, /administrator/i, /admin/i, /support/i, /help\s?desk/i, /service/i,
    /sales/i, /marketing/i, /product/i, /project/i, /program/i, /hr/i, /human\s?resources/i,
    /recruiter/i, /talent/i, /acquisition/i, /finance/i, /accounting/i, /account/i,
    /executive/i, /assistant/i, /associate/i, /lead/i, /senior/i, /junior/i, /entry/i,
    /intern/i, /trainee/i, /graduate/i, /student/i, /professor/i, /teacher/i, /instructor/i,
    /coach/i, /mentor/i, /tutor/i, /writer/i, /editor/i, /journalist/i, /reporter/i,
    /designer/i, /graphic/i, /ui/i, /ux/i, /experience/i, /interface/i, /web/i, /mobile/i,
    /ios/i, /android/i, /game/i, /security/i, /network/i, /system/i, /database/i, /dba/i,
    /quality/i, /qa/i, /tester/i, /test/i, /devops/i, /sre/i, /reliability/i, /operations/i,
    /business/i, /intelligence/i, /data/i, /scientist/i, /analyst/i, /analytics/i, /research/i,
    /legal/i, /lawyer/i, /attorney/i, /counsel/i, /paralegal/i, /medical/i, /doctor/i,
    /physician/i, /nurse/i, /surgeon/i, /therapist/i, /psychologist/i, /psychiatrist/i,
    /social\s?worker/i, /customer/i, /service/i, /success/i, /support/i, /relations/i,
    /public/i, /community/i, /content/i, /communication/i, /driver/i, /operator/i, /technician/i
  ];
  
  // Separate words into categories based on patterns
  const techAndSkills: string[] = [];
  const jobTitles: string[] = [];
  const otherWords: string[] = [];
  
  // Identify potential job titles and tech skills
  filteredWords.forEach(word => {
    let isTechOrSkill = false;
    let isJobTitle = false;
    
    // Check against tech/skills patterns
    for (const pattern of techAndSkillsPatterns) {
      if (pattern.test(word)) {
        techAndSkills.push(word);
        isTechOrSkill = true;
        break;
      }
    }
    
    // Check against job title patterns
    if (!isTechOrSkill) {
      for (const pattern of jobTitlePatterns) {
        if (pattern.test(word)) {
          jobTitles.push(word);
          isJobTitle = true;
          break;
        }
      }
    }
    
    // If it's neither, add to other words
    if (!isTechOrSkill && !isJobTitle) {
      otherWords.push(word);
    }
  });
  
  // Take the most relevant words from each category
  const relevantTechAndSkills = techAndSkills.slice(0, 10);
  const relevantJobTitles = jobTitles.slice(0, 5);
  const relevantOtherWords = otherWords.slice(0, 10);
  
  // Build search string based on type
  let searchString = "";
  
  if (type === "recruiting") {
    // For recruiting, prioritize job titles and tech skills
    const titlePart = relevantJobTitles.length > 0 ? 
      `(${relevantJobTitles.join(" OR ")})` : "";
    
    const skillPart = relevantTechAndSkills.length > 0 ? 
      `(${relevantTechAndSkills.join(" OR ")})` : "";
    
    const otherPart = relevantOtherWords.length > 0 ? 
      `(${relevantOtherWords.join(" OR ")})` : "";
    
    // Combine parts
    const parts = [titlePart, skillPart, otherPart].filter(part => part !== "");
    searchString = parts.join(" AND ");
    
  } else { // lead_generation
    // For lead generation, focus on industry terms
    const allTerms = [...relevantTechAndSkills, ...relevantJobTitles, ...relevantOtherWords];
    const selectedTerms = allTerms.slice(0, 15); // Take top 15 terms
    
    searchString = selectedTerms.length > 0 ? 
      `(${selectedTerms.join(" OR ")})` : "";
      
    // Add title filters for lead generation
    if (type === "lead_generation") {
      searchString += ' AND ("CEO" OR "CTO" OR "CIO" OR "CFO" OR "Director" OR "VP" OR "Vice President" OR "Head of" OR "Manager")';
    }
  }
  
  return searchString;
}
