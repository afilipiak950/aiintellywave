
// AuthUser represents a user from the auth.users table or similar sources
export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    name?: string;
    role?: string;
    [key: string]: any;
  };
  // Support for any additional properties
  [key: string]: any;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  address?: string;
  website?: string;
  tags?: string[];
}

// Add the CompanyData and UserData interfaces
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
  industry?: string;
  logo_url?: string;
  postal_code?: string;
  tags?: string[];
  [key: string]: any;
}

export interface UserData {
  id?: string;
  user_id: string;
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
  tags?: string[];
  [key: string]: any;
}
