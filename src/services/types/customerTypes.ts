
export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  address?: string;
  postal_code?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[];
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  // Add these fields to fix Dashboard.tsx errors
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
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
  tags?: string[];
}
