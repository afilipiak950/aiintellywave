
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
  company_size?: number | string;  // Updated to support both number and string
  linkedin_url?: string;
  notes?: string;
  role?: string;
  company_role?: string;
  associated_companies?: AssociatedCompany[];
  website?: string;
  user_id?: string; // For Admin/Customers.tsx
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

// Add these interfaces needed by customerTransform.ts
export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
}

export interface UserData {
  id?: string;
  user_id?: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
  role?: string;
  is_admin?: boolean;
  avatar_url?: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  created_at?: string;
  last_sign_in_at?: string;
  created_at_auth?: string;
  status?: string; // Added status field
}
