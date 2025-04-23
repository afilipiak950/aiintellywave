
export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';

// Database-compatible status values (used when sending to Supabase)
export type SearchStringDBStatus = 'new' | 'processing' | 'completed' | 'canceled' | 'failed';

// UI status values (includes database values plus UI-specific statuses)
export type SearchStringStatus = SearchStringDBStatus | 'idle' | 'pending' | 'success';

export interface SearchString {
  id: string;
  user_id: string;
  company_id: string | null;
  type: SearchStringType;
  input_source: SearchStringSource;
  input_text?: string | null;
  input_url?: string | null;
  input_pdf_path?: string | null;
  generated_string?: string | null;
  status: SearchStringStatus;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  processed_at?: string | null;
  processed_by?: string | null;
  progress?: number | null;
  error?: string | null;
}
