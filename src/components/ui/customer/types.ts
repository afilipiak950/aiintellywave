
export interface AddCustomerFormData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  language?: string;
  companyName?: string;
  companyId?: string;
  password: string; // Ensure password is included and properly typed
}

export interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}
