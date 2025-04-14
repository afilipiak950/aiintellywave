
// Search parameters interface
export interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  maxResults?: number;
  language?: string;
}

// Job search response interface
export interface JobSearchResponse {
  success: boolean;
  data: {
    id: string;
    results: any[];
    total: number;
  };
  error?: string;
  message?: string;
}

// Job interface matching the one in the frontend
export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted?: string;
  salary?: string;
  employmentType?: string;
  source?: string;
}
