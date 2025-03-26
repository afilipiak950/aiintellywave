
export interface Customer {
  id: string;
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
  users?: any[]; // Define the type for users array
  role?: string;
  position?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
}
