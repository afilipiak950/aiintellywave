
import { openAiApiKey } from "./config.ts";

// Generate summary and FAQs using OpenAI
export async function generateContentWithOpenAI(textContent: string, domain: string): Promise<{ summary: string; faqs: any[] }> {
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
            content: `Create up to 50 frequently asked questions and answers about the content provided${domain ? ` from ${domain}` : ''}. Group the questions by category (e.g., 'Company Information', 'Products', 'Services', etc.). Format your response as a valid JSON object with the structure: {"faqs": [{"id": "unique-id", "question": "Question text?", "answer": "Answer text.", "category": "Category Name"}]}`
          },
          {
            role: "user",
            content: `Based on this content${domain ? ` from ${domain}` : ''}:\n\n${truncatedText}\n\nGenerate FAQs in the specified JSON format.`
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
      
      // Parse the JSON response strictly
      const parsedContent = JSON.parse(faqContent.trim());
      faqs = parsedContent.faqs || [];
      
      // Ensure we have FAQ objects with the expected structure
      faqs = faqs.map((faq: any, index: number) => ({
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
  } catch (error: any) {
    console.error(`OpenAI API error: ${error.message}`);
    throw error;
  }
}
