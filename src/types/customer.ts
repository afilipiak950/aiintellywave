
// Define the types here, then re-export them
export interface Customer {
  id: string;
  user_id?: string;  // Added user_id to differentiate between users and companies
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  projects?: number;
  avatar?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  city?: string;
  country?: string;
  users?: any[];
  role?: string;
  position?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  department?: string;
  job_title?: string;
  company_size?: number;
  linkedin_url?: string;
  notes?: string;
  associated_companies?: AssociatedCompany[];
}

export interface AssociatedCompany {
  id: string;
  name: string;
  role?: string;
  company_name?: string;
  company_id?: string;
}
