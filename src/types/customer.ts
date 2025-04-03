
export interface UICustomer {
  id: string;
  name: string;
  email?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  company?: string;
  company_id?: string;
  company_name?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  description?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  position?: string;
  department?: string;
  job_title?: string;
  company_size?: number;
  linkedin_url?: string;
  notes?: string;
  role?: string;
  company_role?: string;
  associated_companies?: AssociatedCompany[];
  website?: string;  // Added website property for type safety
}

export interface AssociatedCompany {
  id: string;
  name: string;
  company_id: string;
  company_name?: string;
  role?: string;
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
}
