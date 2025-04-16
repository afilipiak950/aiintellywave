
// If this file doesn't exist yet, we'll create it
export interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  company_id?: string;
  company_name?: string;
}

// Add CompanyData interface
export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  address?: string;
  postal_code?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
}

// Add UserData interface with all fields that might be used in the frontend
export interface UserData {
  user_id: string;
  id?: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  company_name?: string;
  role?: string;
  company_role?: string;
  is_admin?: boolean;
  avatar_url?: string;
  phone?: string;
  position?: string;
  created_at?: string;
  last_sign_in_at?: string;
  // Add additional fields that might be used
  is_active?: boolean;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  // Status can be either the union type or string, using type narrowing to handle both
  status?: 'active' | 'inactive' | string;
  // Company info from joins
  companies?: {
    id?: string;
    name?: string;
    contact_email?: string;
    contact_phone?: string;
  }
}
