
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  project_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  status: LeadStatus;
  notes: string | null;
  last_contact: string | null;
  created_at: string;
  updated_at: string;
  score: number;
  tags: string[] | null;
  
  // Joined fields
  project_name?: string;
  company_name?: string;
  
  // For excel data
  excel_data?: Record<string, any>;
}
