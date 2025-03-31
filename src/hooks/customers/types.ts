
export interface Customer {
  id: string;
  user_id?: string; // Added user_id to differentiate users from companies
  name: string;
  company?: string;
  company_name?: string;
  email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  status: string;
  city?: string;
  country?: string;
  company_id?: string;
  description?: string;
  users?: any[];
  role?: string;
  company_role?: string;
}

export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  timestamp?: string;
  checks?: Array<{ name: string; result: boolean | number | string }>;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  specialAdminNote?: string;
  errorDetails?: any;
  error?: string;
  companiesCount?: number;
  companyUsersCount?: number;
  supabaseReplicaError?: string;
  finalCustomersCount?: number;
}

export interface FetchCustomersOptions {
  userId: string;
  userEmail?: string;
}

export interface FetchCustomersResult {
  customers: Customer[];
  debugInfo?: CustomerDebugInfo;
}

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchCustomers: () => Promise<void>;
  debugInfo?: CustomerDebugInfo;
}
