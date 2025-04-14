
export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';
export type SearchStringStatus = 'new' | 'processing' | 'completed' | 'failed';

export interface SearchString {
  id: string;
  company_id: string;
  user_id: string;
  type: SearchStringType;
  input_text?: string;
  input_url?: string;
  input_pdf_path?: string;
  input_source: SearchStringSource;
  generated_string?: string;
  status: SearchStringStatus;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  progress?: number; // This property is needed for the progress bar
}
