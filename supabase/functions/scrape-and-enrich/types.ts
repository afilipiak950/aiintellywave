
export interface JobUpdateParams {
  jobId: string;
  status?: string;
  url?: string;
  progress?: number;
  pageCount?: number;
  domain?: string;
  summary?: string;
  error?: string;
  faqs?: FAQ[];
  user_id?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
