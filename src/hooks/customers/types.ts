
import { Customer } from '@/types/customer';

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  errorMsg: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchCustomers: () => Promise<void>;
  debugInfo?: any; // Add debugInfo to the interface
}
