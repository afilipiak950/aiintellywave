
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface CrawlerOptions {
  url: string;
  maxPages?: number;
  maxDepth?: number;
  selectors?: {
    content?: string;
    title?: string;
    exclude?: string[];
  };
}

export interface CrawlResult {
  success: boolean;
  textContent?: string;
  pageCount?: number;
  domain?: string;
  error?: string;
}

export interface DocumentData {
  name: string;
  content: string;
  type: string;
}

export interface OpenAIResponse {
  summary?: string;
  faqs?: FAQ[];
}

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
}

export interface ProcessResult {
  success: boolean;
  error?: string;
  summary?: string;
  faqs?: FAQ[];
  pageCount?: number;
  domain?: string;
  message?: string;
  jobId?: string;
}
