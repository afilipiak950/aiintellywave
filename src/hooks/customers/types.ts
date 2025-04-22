
// Falls die Datei nicht existiert, erstellen wir sie
export interface Customer {
  id: string;
  name: string;
  status: "active" | "inactive";
  company?: string;
  company_name?: string;
  company_id?: string;
  email?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
  tags?: string[];
  associated_companies?: any[];
  notes?: string;
  monthly_flat_fee?: number;
  appointments_per_month?: number;
  start_date?: string;
  end_date?: string;
  avatar_url?: string;
  company_role?: string;
  role?: string;
  users?: any[];
  description?: string;
  avatar?: string;
  job_offers_enabled?: boolean;
}

export interface UICustomer {
  id: string;
  name: string;
  status: "active" | "inactive";
  email: string;
  company: string;
  type?: string;
  lastActive?: string;
  avatar?: string;
}

export interface CustomerDebugInfo {
  userId: string;
  userEmail?: string;
  timestamp: string;
  error?: string;
  checks: Array<{
    name: string;
    result: boolean | number | string;
    message: string;
  }>;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  specialAdminNote?: string;
  companiesCount?: number;
  companyUsersCount?: number;
  errorDetails?: any;
  finalCustomersCount?: number;
  supabaseReplicaError?: string;
  companyUsersDiagnostics?: any;
  companyUsersRepair?: any;
}

export interface FetchCustomersResult {
  customers: Customer[];
  debugInfo?: CustomerDebugInfo;
}

export interface FetchCustomersOptions {
  userId: string;
  userEmail?: string;
}
