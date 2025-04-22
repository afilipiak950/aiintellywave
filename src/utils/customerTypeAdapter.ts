
import { Customer } from '@/hooks/customers/types';
import { UICustomer } from '@/types/customer';

/**
 * Adapts a Customer object to a UICustomer object,
 * ensuring type compatibility particularly for the status field
 */
export function adaptCustomerToUICustomer(customer: Customer): UICustomer {
  // Ensure status is strictly 'active' or 'inactive'
  let status: 'active' | 'inactive' = 'active';
  
  if (typeof customer.status === 'string') {
    // If status is a string other than 'inactive', default to 'active'
    status = customer.status.toLowerCase() === 'inactive' ? 'inactive' : 'active';
  }
  
  return {
    ...customer,
    status: status
  } as UICustomer;
}
