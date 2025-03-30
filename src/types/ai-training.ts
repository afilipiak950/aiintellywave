
import { FAQ } from "../components/train-ai/FAQAccordion";
import { Json } from "@/integrations/supabase/types";

export interface AITrainingJob {
  jobid: string;
  status: 'processing' | 'completed' | 'failed';
  url?: string | null;
  progress?: number | null;
  pagecount?: number | null;
  domain?: string | null;
  summary?: string | null;
  error?: string | null;
  faqs?: Json | null;
  createdat?: string | null;
  updatedat?: string | null;
}

// Helper function to convert JSON faqs to FAQ[] type
export function parseFaqs(faqs: Json | null): FAQ[] {
  if (!faqs) return [];
  
  try {
    // Handle string input (older format or serialized JSON)
    if (typeof faqs === 'string') {
      try {
        return JSON.parse(faqs) as FAQ[];
      } catch (e) {
        console.error('Failed to parse FAQs string:', e);
        return [];
      }
    }
    
    // Handle array input
    if (Array.isArray(faqs)) {
      return faqs.map((item: any) => ({
        id: item.id || `faq-${Math.random().toString(36).substring(2, 11)}`,
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || 'General'
      }));
    }
    
    // If we have an object with a faqs property (from OpenAI response format)
    if (faqs && typeof faqs === 'object' && 'faqs' in faqs && Array.isArray(faqs.faqs)) {
      return faqs.faqs.map((item: any) => ({
        id: item.id || `faq-${Math.random().toString(36).substring(2, 11)}`,
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || 'General'
      }));
    }
    
    console.error('Unexpected FAQs format:', faqs);
    return [];
  } catch (error) {
    console.error('Error parsing FAQs:', error);
    return [];
  }
}
