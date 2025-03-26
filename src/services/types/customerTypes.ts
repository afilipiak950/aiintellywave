
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
  profiles?: ProfileData | any; // Using any as a fallback since Supabase might return unexpected structure
  companies?: CompanyData | any;
}

// Auth user interface for Supabase auth.users data
export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
  };
}
