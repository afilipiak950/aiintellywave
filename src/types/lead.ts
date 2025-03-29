
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
  website: string | null;  // This property is required by type but doesn't exist in DB
  
  // Joined fields
  project_name?: string;
  company_name?: string;
  
  // For excel data
  excel_data?: boolean | Record<string, any>;
  
  // Dynamic extra fields that don't fit into standard columns
  // Accept both Record<string, any> and Json from Supabase
  extra_data?: Record<string, any> | null;
}
