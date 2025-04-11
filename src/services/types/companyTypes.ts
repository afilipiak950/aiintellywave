
export interface Company {
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

export interface CompanyUser {
  id?: string;
  user_id: string;
  company_id: string;
  role?: string;
  is_admin?: boolean;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  is_primary_company?: boolean;
}

export interface CompanyWithUsers extends Company {
  users: CompanyUser[];
}

export interface CompanyUpdateInput {
  name?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  website?: string;
  address?: string;
  industry?: string;
  tags?: string[];
}
