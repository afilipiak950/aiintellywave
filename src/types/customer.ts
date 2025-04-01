
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
