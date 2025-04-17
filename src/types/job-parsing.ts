
// Job search related types

export interface HRContact {
  id?: string;
  job_offer_id?: string;
  full_name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  source?: string;
  created_at?: string;
}

export interface Job {
  id?: string; // Added id field
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted?: string | null;
  salary?: string | null;
  employmentType?: string | null;
  source?: string;
  directApplyLink?: string | null;
  hrContacts?: HRContact[]; // Array of HR contacts
}

export interface JobSearchHistory {
  id: string;
  user_id: string;
  company_id?: string; // Now optional
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results: Job[]; // Ensure this is defined as an array of Job objects
  created_at: string;
  updated_at?: string;
  ai_contact_suggestion?: any;
}

export type JobOfferRecord = JobSearchHistory;

export interface SearchHistoryOperations {
  loadSearchHistory: (userId: string, companyId: string | null) => Promise<JobSearchHistory[]>;
}
