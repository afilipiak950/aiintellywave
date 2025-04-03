
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
  status?: string; // Add status field
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
  [key: string]: any;
}
