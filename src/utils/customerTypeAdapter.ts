
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
  
  // Return a properly typed UICustomer object with explicit typing
  const uiCustomer: UICustomer = {
    id: customer.id,
    name: customer.name || '',
    email: customer.email,
    status: status,
    avatar: customer.avatar_url || customer.avatar,
    avatar_url: customer.avatar_url || customer.avatar,
    company: customer.company,
    company_id: customer.company_id,
    company_name: customer.company_name,
    contact_email: customer.contact_email,
    contact_phone: customer.contact_phone,
    city: customer.city,
    country: customer.country,
    description: customer.description,
    // Handle potentially missing fields with safe defaults
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    phone: customer.phone || '',
    address: customer.address || '',
    position: customer.position || '',
    department: customer.department || '',
    linkedin_url: customer.linkedin_url || '',
    notes: customer.notes,
    role: customer.role,
    company_role: customer.company_role,
    associated_companies: customer.associated_companies,
    tags: customer.tags,
    website: customer.website,
    user_id: customer.user_id || ''
  };
  
  return uiCustomer;
}
