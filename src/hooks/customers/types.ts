
export interface Customer {
  id: string;
  name: string;
  email?: string;
  status: 'active' | 'inactive' | string; // Modified to be compatible with UICustomer
  company?: string;
  company_id?: string;
  company_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
  avatar?: string;
  tags?: string[];
  associated_companies?: {
    id: string;
    name: string;
    company_id: string;
    role?: string;
    company_name?: string;
    is_primary?: boolean;
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
  // Additional fields needed by components
  website?: string;
  role?: string;
  company_role?: string;
  // Fields to fix current errors
  description?: string;
  job_offers_enabled?: boolean;
  // Missing fields needed by customerTypeAdapter.ts
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  linkedin_url?: string;
  user_id?: string;
  // Add the users property to fix the error in use-manager-customer.ts
  users?: any[];
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
  // Additional properties needed by components
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  specialAdminNote?: string;
  errorDetails?: any;
  companiesCount?: number;
  companyUsersCount?: number;
  supabaseReplicaError?: string;
  finalCustomersCount?: number;
  companyUsersDiagnostics?: {
    status: string;
    totalCount?: number;
    data?: any[];
    error?: string;
  };
  companyUsersRepair?: {
    status: string;
    message?: string;
    error?: string;
    associatedCompanies?: Array<{
      company_id: string;
      company_name?: string;
      role?: string;
      is_primary?: boolean;
    }>;
  };
}

// Add the missing interfaces that were referenced in error messages
export interface FetchCustomersOptions {
  userId: string;
  userEmail?: string;
}
