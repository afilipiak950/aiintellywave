
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
  text: string;
  title: string;
  url: string;
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
