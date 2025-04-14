
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

export interface JobOfferRecord {
  id: string;
  company_id: string;
  user_id: string;
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results: Job[];
  ai_contact_suggestion?: any;
  created_at: string;
  updated_at: string;
}

// Define type for the job_search_history table
export interface JobSearchHistory {
  id: string;
  user_id: string;
  company_id: string;
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results?: any; // Using any to handle JSON type from Supabase
  ai_contact_suggestion?: any;
  created_at: string;
  updated_at: string;
}
