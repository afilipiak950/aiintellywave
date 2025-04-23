
export type SearchStringType = 'recruiting' | 'lead-generation';

export type SearchStringSource = 'text' | 'website' | 'pdf';

export type SearchStringStatus = 'idle' | 'pending' | 'success' | 'failed' | 'canceled' | 'new' | 'processing' | 'completed';

// Status values used in the database
export type SearchStringDBStatus = 'new' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface SearchString {
  id: string;
  user_id: string;
  company_id?: string;
  type: SearchStringType;
  input_source: SearchStringSource;
  input_text?: string | null;
  input_url?: string | null;
  input_pdf_path?: string | null;
  generated_string?: string | null;
  status: SearchStringDBStatus;
  error?: string | null;
  is_processed: boolean;
  progress: number;
  created_at: string;
  processed_at?: string | null;
  updated_at?: string | null;
  is_featured?: boolean;
}
