
// Shared types for customer-related services
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
}

export interface ProfileData {
  id?: string;  // Made optional since it might be missing in some cases
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
}

// Interface for the data structure returned by Supabase
export interface CompanyUserData {
  user_id: string;
  company_id: string;
  role?: string;
  is_admin?: boolean;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  last_sign_in_at?: string;
  created_at_auth?: string;
  profiles?: ProfileData | any; // Using any as a fallback since Supabase might return unexpected structure
  companies?: CompanyData | any;
}

// Auth user interface for Supabase auth.users data
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  created_at_auth?: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    role?: string;
  };
  role?: string;
}

// This is the UI customer type used in most components
export interface UICustomer {
  id: string;
  user_id?: string;  // Added user_id to differentiate between users and companies
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  projects?: number;
  avatar?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  users?: any[];
  role?: string;
  position?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  department?: string;
  job_title?: string;
  company_size?: number;
  linkedin_url?: string;
  notes?: string;
  associated_companies?: AssociatedCompany[];
}

// For company associations
export interface AssociatedCompany {
  id: string;
  name: string;
  role?: string;
  company_name?: string;
  company_id?: string;
}

// Revenue-specific Customer type for the customers table
export interface Customer {
  id: string;
  name: string;
  conditions: string;
  appointments_per_month: number;
  price_per_appointment: number;
  setup_fee: number;
  monthly_flat_fee: number;
  monthly_revenue?: number;
  end_date?: string | null;
  start_date?: string | null;
  created_at?: string;
  updated_at?: string;
}
