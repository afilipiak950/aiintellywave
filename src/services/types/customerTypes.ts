
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
}

export interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  is_active?: boolean;
}

export interface CompanyUserData {
  user_id: string;
  company_id: string;
  role?: string;
  is_admin?: boolean;
  profiles?: ProfileData;
  companies?: CompanyData;
}
