
import { Customer as BaseCustomer, AssociatedCompany } from '@/types/customer';

// Re-export the base Customer type
export type Customer = BaseCustomer;

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchCustomers: () => Promise<void>;
  debugInfo?: any; // Add debugInfo to the interface
}

// Add specific interfaces for different parts of the customer fetching process
export interface CustomerDebugInfo {
  userId?: string;
  userEmail?: string;
  timestamp: string;
  isAdmin?: boolean;
  isSpecialAdmin?: boolean;
  companiesCount?: number;
  companyUsersCount?: number;
  finalCustomersCount?: number;
  checks?: Array<{ name: string; result: any }>;
  errors?: Array<{ type: string; error: any }>;
  [key: string]: any;
}

export interface FetchCustomersOptions {
  userId: string;
  userEmail?: string;
}

export interface FetchCustomersResult {
  customers: Customer[];
  debugInfo: CustomerDebugInfo;
}
