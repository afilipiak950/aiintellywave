
// Job search related types

export interface HRContact {
  id?: string;
  job_offer_id?: string;
  full_name: string;
  role: string;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null; // LinkedIn URL
  seniority?: string | null;    // Seniority level
  department?: string | null;   // Department 
  source?: string;
  created_at?: string;
}

export interface Job {
  id?: string;
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
  companyDomain?: string | null; // Company domain for enrichment
}

export interface JobSearchHistory {
  id: string;
  user_id: string;
  company_id?: string; // Now optional
  search_query: string;
  search_location?: string;
  search_experience?: string;
  search_industry?: string;
  search_results: Job[]; // Array of Job objects
  created_at: string;
  updated_at?: string;
  ai_contact_suggestion?: any;
}

export type JobOfferRecord = JobSearchHistory;

export interface SearchHistoryOperations {
  loadSearchHistory: (userId: string, companyId: string | null) => Promise<JobSearchHistory[]>;
}

// Database model types - these match the Supabase tables
export interface JobOfferModel {
  id: string;
  title: string;
  company_name: string;
  location?: string;
  description?: string;
  url: string;
  posted_at?: string;
  source?: string;
}

export interface HRContactModel {
  id: string;
  job_offer_id: string;
  full_name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  seniority?: string;
  department?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}
