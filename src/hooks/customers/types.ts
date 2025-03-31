
// If this file doesn't exist, we'll create it with all necessary types
export interface Customer {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  email?: string; 
  city?: string;
  country?: string;
  company?: string;
  company_name?: string;
  company_id?: string;
  status?: string;
  role?: string;
  users?: any[];
}

export interface CompanyUsersDiagnostics {
  status: 'error' | 'completed' | 'exception' | 'used_rpc';
  error?: string;
  queryAttempted?: string;
  totalCount?: number;
  userCompaniesFound?: boolean;
  userCompanyData?: any[];
  data?: any[];
}

export interface CompanyUsersRepair {
  started?: boolean;
  status?: 'error' | 'success' | 'exception' | 'exists';
  error?: string;
  message?: string;
  attempted?: string;
  existing?: any;
  inserted?: any;
}

export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  timestamp?: string;
  companiesCount?: number;
  companyUsersCount?: number;
  fetchMethod?: string;
  adminRepairAttempt?: boolean;
  adminRepair?: any;
  checks?: Array<{name: string, result: any}>;
  error?: string;
  errorDetails?: any;
  errors?: Array<{type: string, error: any}>;
  finalCustomersCount?: number;
  specialAdminNote?: string;
  companyUsersDiagnostics?: CompanyUsersDiagnostics;
  companyUsersRepair?: CompanyUsersRepair;
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
