
import { Customer } from '@/types/customer';

export const formatUserDataToCustomer = (userData: any): Customer => {
  // Create a full name from first and last name if available, or use email as fallback
  let fullName = userData.full_name || '';
  
  if (!fullName && (userData.first_name || userData.last_name)) {
    fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
  } 
  
  // If no name is available, use the email or a default
  if (!fullName && userData.email) {
    fullName = userData.email.split('@')[0]; // Use part before @ as a name
  }
  
  const finalName = fullName || 'Unnamed User';
  
  return {
    id: userData.id,
    name: finalName,
    email: userData.email || '',
    phone: userData.phone || '',
    avatar: userData.avatar_url,
    status: userData.is_active ? 'active' : 'inactive',
    role: userData.company_role || 'customer',
    position: userData.position || '',
    company: userData.company_name || '',
    company_id: userData.company_id,
    company_name: userData.company_name,
    city: userData.city,
    country: userData.country,
    contact_email: userData.contact_email,
    contact_phone: userData.contact_phone
  };
};

export const filterCustomersBySearchTerm = (customers: Customer[], searchTerm: string): Customer[] => {
  if (!searchTerm) return customers;
  
  const searchLower = searchTerm.toLowerCase();
  
  return customers.filter(customer => {
    const nameMatch = customer.name.toLowerCase().includes(searchLower);
    const emailMatch = customer.email?.toLowerCase().includes(searchLower) || false;
    const companyMatch = customer.company?.toLowerCase().includes(searchLower) || false;
    const roleMatch = customer.role?.toLowerCase().includes(searchLower) || false;
    
    return nameMatch || emailMatch || companyMatch || roleMatch;
  });
};
