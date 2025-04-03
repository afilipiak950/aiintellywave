
// Define the JSON type directly here instead of importing it
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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

export type JobStatus = 'idle' | 'processing' | 'completed' | 'failed';
