
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
