import { UICustomer } from '@/types/customer';

export const formatUserDataToCustomer = (userData: any): UICustomer => {
  // Create a customer object from user data
  return {
    id: userData.id || userData.user_id,
    name: userData.full_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unnamed User',
    email: userData.email || '',
    phone: userData.phone || '',
    avatar: userData.avatar_url,
    status: userData.is_active ? 'active' : 'inactive',
    role: userData.company_role || userData.role || 'customer',
    position: userData.position || '',
    company: userData.company_name || '',
    company_id: userData.company_id || '',
    company_name: userData.company_name || '',
    city: userData.city || '',
    country: userData.country || '',
    contact_email: userData.contact_email || userData.email || '',
    contact_phone: userData.contact_phone || userData.phone || ''
  };
};

export const filterCustomersBySearchTerm = (customers: UICustomer[], searchTerm: string): UICustomer[] => {
  if (!searchTerm) return customers;
  
  const searchLower = searchTerm.toLowerCase();
  
  return customers.filter(customer => {
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    const emailMatch = (customer.email?.toLowerCase().includes(searchLower)) || false;
    const companyMatch = (customer.company?.toLowerCase().includes(searchLower)) || false;
    const roleMatch = (customer.role?.toLowerCase().includes(searchLower)) || false;
    
    return nameMatch || emailMatch || companyMatch || roleMatch;
  });
};

/**
 * Get the initials from a name
 * @param name The full name
 * @returns The initials (up to 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
