
import { FAQ } from '@/components/train-ai/FAQAccordion';

export type JobStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface AITrainingState {
  url: string;
  isLoading: boolean;
  isUploading: boolean;
  progress: number;
  stage: string;
  summary: string;
  faqs: FAQ[];
  error: string | null;
  pageCount: number;
  selectedFiles: File[];
  activeJobId: string | null;
  jobStatus: JobStatus;
}

export interface FileContent {
  name: string;
  content: string;
  type: string;
}
