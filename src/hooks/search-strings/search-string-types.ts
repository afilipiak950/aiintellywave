
export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';
export type SearchStringStatus = 'new' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface SearchString {
  id: string;
  user_id: string;
  company_id?: string;
  type: SearchStringType;
  input_source: SearchStringSource;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  generated_string?: string;
  status: SearchStringStatus;
  progress?: number | null;
  is_processed: boolean;
  processed_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}
