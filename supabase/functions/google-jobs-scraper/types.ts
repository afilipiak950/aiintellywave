
// Input types for the Apify API
export interface ApifyInput {
  queries: {
    searchTerm: string;
    location?: string;
    language?: string;
  }[];
  maxPagesPerQuery: number;
  proxyConfiguration: {
    useApifyProxy: boolean;
  };
}

// Result type from the Apify API
export interface ApifyResult {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  date?: string;
  salary?: string;
  employmentType?: string;
}

// Formatted job type for our application
export interface FormattedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted?: string;
  salary?: string;
  employmentType?: string;
  source: string;
}

// Search parameters from the frontend
export interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
}

// Job search request from the frontend
export interface JobSearchRequest {
  searchParams: SearchParams;
  userId: string;
  companyId: string;
}

// Response to the frontend
export interface JobSearchResponse {
  success: boolean;
  data?: {
    id: string;
    results: FormattedJob[];
    total: number;
  };
  error?: string;
  details?: any;
}
