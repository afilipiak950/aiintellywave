
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
