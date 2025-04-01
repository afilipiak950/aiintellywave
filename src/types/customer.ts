
// UI Customer type - used in the UI components for displaying customer information
export interface UICustomer {
  id: string;
  user_id?: string;
  name: string;
  company?: string;
  company_name?: string;
  email?: string;
  contact_email?: string;
  phone?: string;
  contact_phone?: string;
  status: string;
  city?: string;
  country?: string;
  company_id?: string;
  description?: string;
  position?: string;
  role?: string;
  company_role?: string;
  avatar_url?: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
  associated_companies?: AssociatedCompany[];
  job_title?: string;
  department?: string;
  address?: string;
  linkedin_url?: string;
  company_size?: string;
  notes?: string;
}

// Company information associated with a customer
export interface AssociatedCompany {
  id: string;
  name: string;
  company_id: string;
  company_name: string;
  role?: string;
}

// Company data type for handling company information
export interface CompanyData {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
}

// User data type for handling user information
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
