
export interface AddCustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyId?: string;  // New field for existing company selection
  role: string;  // Changed from enum to string type
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  language?: string;
}
