
import { Customer } from '@/hooks/customers/types';
import { UICustomer } from '@/types/customer';

/**
 * Adapts a Customer object to a UICustomer object,
 * ensuring type compatibility particularly for the status field
 */
export function adaptCustomerToUICustomer(customer: Customer): UICustomer | null {
  if (!customer) {
    console.error('Cannot adapt null or undefined customer');
    return null;
  }

  // Ensure status is strictly 'active' or 'inactive'
  let status: 'active' | 'inactive' = 'active';
  
  if (typeof customer.status === 'string') {
    status = customer.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
  }
  
  // Return a properly typed UICustomer object with explicit type casting
  const uiCustomer: UICustomer = {
    ...customer,
    status: status
  };
  
  return uiCustomer;
}
