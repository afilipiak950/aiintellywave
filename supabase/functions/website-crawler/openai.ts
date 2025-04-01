
import { generateSummary } from "./openai/generate-summary.ts";
import { generateFaqs } from "./openai/generate-faqs.ts";

// Generate summary and FAQs using OpenAI
export async function generateContentWithOpenAI(textContent: string, domain: string): Promise<{ summary: string; faqs: any[] }> {
  try {
    // Generate summary
    const summary = await generateSummary(textContent, domain);
    
    // Generate FAQs
    const faqs = await generateFaqs(textContent, domain);
    
    return {
      summary,
      faqs
    };
  } catch (error: any) {
    console.error(`OpenAI API error: ${error.message}`);
    throw error;
  }
}
