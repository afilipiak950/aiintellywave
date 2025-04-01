
import { openAiApiKey } from "../config.ts";
import { FAQ } from "../types.ts";

// Generate FAQs using OpenAI
export async function generateFaqs(textContent: string, domain: string): Promise<FAQ[]> {
  console.log("Generating 100 FAQs");
  
  try {
    // Truncate text if it's too long (OpenAI has context limits)
    const maxLength = 32000; // Safe limit for context window
    const truncatedText = textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + "... [content truncated due to length]" 
      : textContent;
    
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
            content: `Create exactly 100 frequently asked questions and answers about the content provided${domain ? ` from ${domain}` : ''}. Group the questions by category (e.g., 'Company Information', 'Products', 'Services', etc.). Format your response as a valid JSON object with the structure: {"faqs": [{"id": "unique-id", "question": "Question text?", "answer": "Answer text.", "category": "Category Name"}]}. Make sure to generate exactly 100 FAQs total, not more or less.`
          },
          {
            role: "user",
            content: `Based on this content${domain ? ` from ${domain}` : ''}:\n\n${truncatedText}\n\nGenerate exactly 100 FAQs in the specified JSON format. Ensure you create exactly 100 FAQ items total.`
          }
        ],
        temperature: 0.7,
        max_tokens: 8000, // Increased token limit to accommodate more FAQs
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
      
      console.log(`Generated ${faqs.length} FAQs`);
      
      // In case we didn't get exactly 100 FAQs, log a warning
      if (faqs.length !== 100) {
        console.warn(`Expected 100 FAQs, but got ${faqs.length}`);
      }
      
      return faqs;
    } catch (e) {
      console.error("Error parsing FAQs JSON:", e);
      return [];
    }
  } catch (error: any) {
    console.error(`OpenAI API error during FAQ generation: ${error.message}`);
    throw error;
  }
}
