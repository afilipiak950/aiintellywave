
export interface ClayWorkbook {
  id: string;
  user_id: string;
  company_id: string | null;
  query_payload: Record<string, any>;
  workbook_url: string;
  status: 'pending' | 'ready' | 'error';
  error?: string | null;
  created_at: string;
  updated_at: string;
}
