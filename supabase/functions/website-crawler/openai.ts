import { openAiApiKey } from "./config.ts";

export async function generateContentWithOpenAI(textContent: string, domain: string) {
  if (!openAiApiKey) {
    throw new Error("OpenAI API key is not configured");
  }
  
  try {
    // Log the size of content being sent to OpenAI
    console.log(`Generating OpenAI content for domain: ${domain}`);
    console.log(`Text content length: ${textContent.length} characters`);
    
    // Truncate content if it's too large
    let processedContent = textContent;
    const maxTokens = 16000; // Leave room for completion
    const avgCharsPerToken = 4; // Approximation for English
    const maxChars = maxTokens * avgCharsPerToken;
    
    if (processedContent.length > maxChars) {
      console.log(`Content too large (${processedContent.length} chars), truncating to ~${maxChars} chars`);
      processedContent = processedContent.substring(0, maxChars);
      console.log("Content truncated to fit token limits");
    }
    
    // Prepare prompt for summary only (FAQs are generated separately)
    const prompt = `
Please analyze the content of the website ${domain || "provided"} and create a comprehensive summary of what the website is about (300-500 words).

The summary should:
- Be well-structured and informative
- Capture key information about the site's purpose, products, services, etc.
- Be written in a professional tone
- Extract real information from the content, don't make things up
- If the content is insufficient, indicate what information is missing

WEBSITE CONTENT:
${processedContent}
`;

    // Make OpenAI API call with retry logic
    const maxRetries = 2;
    let retries = 0;
    let response;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Calling OpenAI API for summary (attempt ${retries + 1}/${maxRetries + 1})`);
        
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiApiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            max_tokens: 2000, // Reduced since we only need the summary now
          })
        });
        
        // Check if we got a valid response
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
        }
        
        // If we got here, we succeeded, so break out of retry loop
        break;
      } catch (err) {
        console.error(`OpenAI API call failed (attempt ${retries + 1}/${maxRetries + 1}):`, err);
        
        // If we've hit max retries, rethrow
        if (retries >= maxRetries) {
          throw err;
        }
        
        // Otherwise, wait and retry
        retries++;
        await new Promise(resolve => setTimeout(resolve, 2000 * retries)); // Exponential backoff
      }
    }
    
    // Parse response
    if (!response) {
      throw new Error("Failed to get response from OpenAI API after retries");
    }
    
    const responseData = await response.json();
    
    if (!responseData.choices || responseData.choices.length === 0) {
      console.error("Unexpected OpenAI API response:", responseData);
      throw new Error("Invalid response from OpenAI API");
    }
    
    // Extract text content from response
    const content = responseData.choices[0].message.content;
    
    // Return only the summary (FAQs are generated separately)
    return {
      summary: content,
      faqs: [] // Empty array, as FAQs are generated separately now
    };
    
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw error;
  }
}
