
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
    
    return faqs as FAQ[];
  } catch (error) {
    console.error('Error parsing FAQs:', error);
    return [];
  }
}
