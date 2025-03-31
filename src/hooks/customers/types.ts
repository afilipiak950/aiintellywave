
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
  avatar_url?: string; // Added avatar_url property
  avatar?: string;     // Added avatar property
  full_name?: string;  // Added full_name property to fix error
}

export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  timestamp?: string;
  checks?: Array<{ name: string; result: boolean | number | string }>;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  specialAdminNote?: string;
  error?: string;
  errorDetails?: any;
  companiesCount?: number;
  companyUsersCount?: number;
  supabaseReplicaError?: string;
  finalCustomersCount?: number;
  authUsersCount?: number;         // Added missing property to fix error
  authUsersFetchError?: string;    // Added missing property to fix error
  
  // Added fields to resolve type errors
  companyUsersDiagnostics?: {
    status: string;
    totalCount?: number;
    error?: string;
    queryAttempted?: string;
    userCompaniesFound?: boolean;
    userCompanyData?: any[];
    data?: any;
  };
  
  companyUsersRepair?: {
    started?: boolean;
    status?: string;
    message?: string;
    error?: string;
    existing?: any;
    attempted?: string;
    inserted?: any;
  };
  
  adminRepairAttempt?: boolean;
  adminRepair?: {
    action?: string;
    id?: string;
    error?: any;
    role_status?: string;
    company_user_status?: string;
    details?: any;
  };
  
  fetchMethod?: string;
  errors?: Array<{ type: string; error: any }>;
  userCompanyIds?: string[];
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
