
export interface AddCustomerFormData {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  role: 'admin' | 'manager' | 'customer';
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  language?: string;
}
