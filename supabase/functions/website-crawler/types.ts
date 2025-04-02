
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface JobUpdateParams {
  jobId: string;
  status?: 'processing' | 'completed' | 'failed';
  url?: string;
  progress?: number;
  pageCount?: number;
  domain?: string;
  summary?: string;
  error?: string;
  faqs?: FAQ[];
  user_id?: string;
}
