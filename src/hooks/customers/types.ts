
// Types for the customers hooks
import { AssociatedCompany } from '@/types/customer';

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
  role?: string; // String type for role
  position?: string;
  company_id?: string;
  company_name?: string;
  company_role?: string;
  
  // Extended customer profile fields
  first_name?: string;
  last_name?: string;
  address?: string;
  department?: string;
  job_title?: string;
  company_size?: number;
  linkedin_url?: string;
  notes?: string;
  
  // Add associated companies field to handle users with multiple company associations
  associated_companies?: AssociatedCompany[];
}

export interface AssociatedCompany {
  id: string;
  name: string;
  role?: string;
}

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchCustomers: () => Promise<void>;
}
