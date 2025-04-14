
export type SearchStringType = 'recruiting' | 'lead_generation';
export type SearchStringSource = 'text' | 'website' | 'pdf';
export type SearchStringStatus = 'new' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface SearchString {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  company_id?: string;
  type: SearchStringType;
  input_source: SearchStringSource;
  input_text?: string | null;
  input_url?: string | null;
  input_pdf_path?: string | null;
  status: SearchStringStatus;
  progress: number;
  generated_string: string | null;
  is_featured: boolean;
  is_processed?: boolean;
  processed_at?: string | null;
  processed_by?: string | null;
}
