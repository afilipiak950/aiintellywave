
import { FAQ } from "../components/train-ai/FAQAccordion";

export interface AITrainingJob {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  url?: string | null;
  progress?: number | null;
  pageCount?: number | null;
  domain?: string | null;
  summary?: string | null;
  error?: string | null;
  faqs?: FAQ[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
