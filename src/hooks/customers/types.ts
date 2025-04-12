
// If this file doesn't exist yet, we need to create it with proper type definitions
export interface Customer {
  id: string;
  user_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name: string; // Making this required to match UICustomer
  company_id?: string;
  company_name?: string;
  company?: string;
  role?: string;
  company_role?: string;
  is_admin?: boolean;
  avatar_url?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  city?: string;
  country?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive'; // Making this required to match UICustomer
  description?: string;
  users?: any[];
  address?: string;
  website?: string;
  // Add the associated_companies property
  associated_companies?: Array<{
    id: string;
    name: string;
    company_id: string;
    company_name?: string;
    role?: string;
    is_primary?: boolean;
  }>;
  // Add the primary_company property
  primary_company?: {
    id: string;
    name: string;
    company_id: string;
    role?: string;
  };
  is_primary_company?: boolean;
  // Add tags property
  tags?: string[];
  // Add notes property that's missing
  notes?: string;
  // Add the missing fields for the customer table
  setup_fee?: number;
  price_per_appointment?: number;
  monthly_revenue?: number;
}

export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  timestamp: string;
  checks: Array<{ name: string, result: boolean | string | number }>;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  companiesCount?: number;
  companyUsersCount?: number;
  finalCustomersCount?: number;
  error?: string;
  errorDetails?: any;
  fetchMethod?: string;
  errors?: Array<{ type: string, error: any }>;
  adminRepairAttempt?: boolean;
  adminRepair?: any;
  companyUsersDiagnostics?: {
    status: string;
    totalCount?: number;
    data?: any;
    error?: string;
  };
  companyUsersRepair?: {
    status: string;
    message?: string;
    error?: string;
    associatedCompanies?: Array<{
      id?: string;
      company_id: string;
      company_name?: string;
      role?: string;
      is_primary?: boolean;
    }>;
  };
  specialAdminNote?: string;
}

export interface FetchCustomersResult {
  customers: Customer[];
  debugInfo?: CustomerDebugInfo;
}

export interface FetchCustomersOptions {
  userId: string;
  userEmail?: string;
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
