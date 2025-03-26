
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
  user_id: string;
  email?: string;
  company_id?: string;
  role?: string;
  // Profile fields
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  is_admin?: boolean;
}
