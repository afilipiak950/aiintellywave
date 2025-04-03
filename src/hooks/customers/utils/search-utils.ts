
import { Customer } from '../types';

export function filterCustomersBySearchTerm(
  customers: Customer[],
  searchTerm: string
): Customer[] {
  if (!searchTerm) return customers;
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return customers.filter(customer => 
    (customer.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.description || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.contact_email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.email || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.city || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.country || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.company || '').toLowerCase().includes(lowerCaseSearchTerm) ||
    (customer.company_name || '').toLowerCase().includes(lowerCaseSearchTerm)
  );
}
