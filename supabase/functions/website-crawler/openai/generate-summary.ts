
import { openAiApiKey } from "../config.ts";

// Generate summary using OpenAI
export async function generateSummary(textContent: string, domain: string): Promise<string> {
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
    
    return summaryResult.choices[0].message.content;
  } catch (error: any) {
    console.error(`OpenAI API error during summary generation: ${error.message}`);
    throw error;
  }
}
