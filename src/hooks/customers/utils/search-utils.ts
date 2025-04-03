
import { Customer } from "../types";

/**
 * Filter customers by search term
 */
export function filterCustomersBySearchTerm(customers: Customer[], searchTerm: string): Customer[] {
  if (!searchTerm) {
    return customers;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return customers.filter(customer => {
    // Check various customer properties for the search term
    return (
      (customer.full_name?.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.email?.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.company_name?.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.city?.toLowerCase().includes(lowerSearchTerm)) ||
      (customer.country?.toLowerCase().includes(lowerSearchTerm))
    );
  });
}
