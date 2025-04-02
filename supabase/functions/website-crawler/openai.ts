import { openAiApiKey } from "./config.ts";
import type { FAQ } from "./types.ts";

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
    
    // Prepare prompt
    const prompt = `
I need you to analyze the content of the website ${domain || "provided"} and create:
1. A comprehensive summary of what the website is about (300-500 words)
2. A list of frequently asked questions (FAQs) with answers based on the content.

Follow these guidelines:
- Create a well-structured summary that captures the key information
- Generate at least 10 but not more than 20 FAQs
- Each FAQ should have a question and comprehensive answer
- Group FAQs by category (e.g., "General", "Products", "Services", etc.)
- Extract real information from the content, don't make things up
- If the content is insufficient, indicate what information is missing

WEBSITE CONTENT:
${processedContent}

OUTPUT FORMAT:
Provide your output as a JSON object with the following structure:
{
  "summary": "Your comprehensive summary here...",
  "faqs": [
    {
      "id": "1",
      "question": "Question 1?",
      "answer": "Answer to question 1",
      "category": "Category name"
    },
    ...more FAQs
  ]
}
`;

    // Make OpenAI API call with retry logic
    const maxRetries = 2;
    let retries = 0;
    let response;
    
    while (retries <= maxRetries) {
      try {
        console.log(`Calling OpenAI API (attempt ${retries + 1}/${maxRetries + 1})`);
        
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
            max_tokens: 4000,
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
    
    try {
      // Try to parse the response as JSON
      let extractedJson;
      
      try {
        // First, try to parse directly
        extractedJson = JSON.parse(content);
      } catch (parseError) {
        // If that fails, try to extract JSON from the text
        console.log("Direct JSON parsing failed, attempting to extract JSON");
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/```([\s\S]*?)```/) ||
                         content.match(/{[\s\S]*}/);
                         
        if (jsonMatch && jsonMatch[1]) {
          extractedJson = JSON.parse(jsonMatch[1]);
        } else if (jsonMatch) {
          extractedJson = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from OpenAI response");
        }
      }
      
      // Validate the extracted JSON has the expected fields
      if (!extractedJson.summary) {
        console.error("Missing summary in JSON response");
        extractedJson.summary = "Unable to generate summary from the provided content.";
      }
      
      if (!extractedJson.faqs || !Array.isArray(extractedJson.faqs)) {
        console.error("Missing or invalid FAQs in JSON response");
        extractedJson.faqs = [];
      }
      
      // Ensure each FAQ has required fields and a unique ID
      const validatedFaqs: FAQ[] = extractedJson.faqs.map((faq: any, index: number) => ({
        id: faq.id || `faq-${index + 1}`,
        question: faq.question || "Question not provided",
        answer: faq.answer || "Answer not available",
        category: faq.category || "General"
      }));
      
      return {
        summary: extractedJson.summary,
        faqs: validatedFaqs
      };
      
    } catch (jsonError) {
      console.error("Failed to parse OpenAI response as JSON:", jsonError);
      console.error("Raw content:", content);
      
      // Fallback to returning a minimal valid response
      return {
        summary: "We were unable to generate a proper summary due to a formatting error. Please try again.",
        faqs: [
          {
            id: "error-1",
            question: "Why did the analysis fail?",
            answer: "There was an error processing the OpenAI response. Please try again or contact support.",
            category: "Error"
          }
        ]
      };
    }
    
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw error;
  }
}
