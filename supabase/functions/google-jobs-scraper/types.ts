
// Define the common types for the Google Jobs scraper

export interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  industry?: string;
  language?: string;
  maxResults?: number;
  forceNewSearch?: boolean;
  includeRealLinks?: boolean;
}

export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted?: string | null;
  salary?: string | null;
  employmentType?: string | null;
  source?: string;
  directApplyLink?: string; // Direct application link if available
}

export interface JobSearchResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    id: string;
    results: Job[];
    total: number;
  };
  fallback?: boolean;
  details?: any;
}

export interface JobOfferRecord {
  id: string;
  company_id: string;
  user_id: string;
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results?: Job[];
  created_at: string;
  updated_at?: string;
  ai_contact_suggestion?: any;
}
