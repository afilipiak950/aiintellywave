
export interface AddCustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  companyId?: string;  // New field for existing company selection
  role: 'admin' | 'manager' | 'customer';
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  language?: string;
}
