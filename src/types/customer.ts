
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
  company_size?: string;  // Changed from 'string | number' to just 'string'
  linkedin_url?: string;
  notes?: string;
  role?: string;
  company_role?: string;
  associated_companies?: AssociatedCompany[];
  primary_company?: AssociatedCompany;
  is_primary_company?: boolean;
  website?: string;
  user_id?: string; // For Admin/Customers.tsx
  users?: any[]; // Array of users associated with this company
  tags?: string[]; // Added tags property
}

export interface AssociatedCompany {
  id: string;
  name: string;
  company_id: string;
  company_name?: string;
  role?: string;
  is_primary?: boolean;
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
  address?: string;
  website?: string;
  tags?: string[]; // Added tags property
}

export interface UserData {
  id?: string;
  user_id: string;  // Make user_id required to match customerTypes.ts
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
  status?: string;
  tags?: string[];
}
