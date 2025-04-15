
// Job search related types

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
}

export interface JobSearchHistory {
  id: string;
  user_id: string;
  company_id: string;
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results?: Job[] | any; // Modified to accept both Job[] and Json type
  created_at: string;
  updated_at?: string;
  ai_contact_suggestion?: any;
}

export type JobOfferRecord = JobSearchHistory;

export interface SearchHistoryOperations {
  loadSearchHistory: (userId: string, companyId: string) => Promise<JobSearchHistory[]>;
}
