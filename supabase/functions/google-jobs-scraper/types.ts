
export interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
}

export interface ApifyInput {
  queries: Array<{
    searchTerm: string;
    location: string;
    language: string;
  }>;
  maxPagesPerQuery: number;
  proxyConfiguration: {
    useApifyProxy: boolean;
  };
}

export interface ApifyResult {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  date: string;
  salary: string;
  employmentType: string;
  [key: string]: any;
}

export interface FormattedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted: string;
  salary: string;
  employmentType: string;
  source: string;
}

export interface JobSearchResponse {
  success: boolean;
  data?: {
    id: string;
    results: FormattedJob[];
    total: number;
  };
  error?: string;
  details?: string;
}
