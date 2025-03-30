
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
    if (typeof faqs === 'string') {
      return JSON.parse(faqs) as FAQ[];
    }
    
    if (Array.isArray(faqs)) {
      // Ensure each item has the expected FAQ shape
      return faqs.map((item: any) => ({
        id: item.id || `faq-${Math.random().toString(36).substring(2, 11)}`,
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || 'General'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing FAQs:', error);
    return [];
  }
}
