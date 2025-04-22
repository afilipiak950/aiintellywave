
export interface Customer {
  id: string;
  name: string;
  email?: string;
  status: string;
  company?: string;
  company_id?: string;
  company_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  tags?: string[];
  associated_companies?: {
    id: string;
    name: string;
    company_id: string;
    role?: string;
  }[];
  notes?: string;
  // Customer-specific fields from the customers table
  setup_fee?: number;
  price_per_appointment?: number;
  monthly_flat_fee?: number;
  appointments_per_month?: number;
  monthly_revenue?: number;
  start_date?: string;
  end_date?: string;
}

export interface FetchCustomersResult {
  customers: Customer[];
  debugInfo: CustomerDebugInfo;
}

export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  timestamp?: string;
  error?: string;
  checks?: Array<{ name: string; result: boolean | number | string }>;
}
