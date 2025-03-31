
import { Customer } from '../types';

/**
 * Filter customers by search term
 */
export function filterCustomersBySearchTerm(
  customers: Customer[],
  searchTerm: string
): Customer[] {
  if (!searchTerm) return customers;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return customers.filter(customer => 
    customer.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.contact_email?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.company?.toLowerCase().includes(lowerCaseSearchTerm) ||
    customer.company_name?.toLowerCase().includes(lowerCaseSearchTerm)
  );
}
