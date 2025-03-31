export interface Customer {
  id: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  company_id?: string;
  is_admin?: boolean;
  status?: 'active' | 'inactive';
  role?: string;
  last_sign_in_at?: string;
}

export interface UserData {
  user_id: string;
  company_id: string;
  role: string;
  is_admin: boolean;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata?: any;
  user_metadata?: any;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface CustomerListType {
  id: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  company_id?: string;
  is_admin?: boolean;
  status: 'active' | 'inactive';
  role?: string;
  last_sign_in_at?: string;
}

export interface AddCustomerFormData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  language?: string;
  companyId?: string;
  companyName?: string;
  password: string;
}
