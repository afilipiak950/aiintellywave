
import { Customer } from './types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if the current user has admin role
 */
export const checkIsAdminUser = async (userId: string, userEmail?: string): Promise<boolean> => {
  // For admin@intellywave.de, we can directly return true
  if (userEmail === 'admin@intellywave.de') {
    console.log('Admin email detected, treating as admin user');
    return true;
  }
  
  try {
    // Try to get user role from user_roles table
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (roleError) {
      console.error('Error checking user role:', roleError);
      return false;
    }
    
    return userRole?.role === 'admin';
  } catch (error) {
    console.error('Error determining admin status:', error);
    return false;
  }
}

/**
 * Format company data into customer objects
 */
export const formatCompanyDataToCustomers = (companyData: any[]): Customer[] => {
  return companyData.map(company => {
    const users = company.company_users || [];
    
    return {
      id: company.id,
      name: company.name,
      company: company.name,
      email: company.contact_email || '',
      phone: company.contact_phone || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || '',
      status: 'active' as 'active' | 'inactive',
      city: company.city || '',
      country: company.country || '',
      users: users,
    };
  });
}

/**
 * Filter customers based on search term
 */
export const filterCustomersBySearchTerm = (customers: Customer[], searchTerm: string): Customer[] => {
  if (!searchTerm) return customers;
  
  const searchLower = searchTerm.toLowerCase();
  return customers.filter(customer => {
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.contact_email?.toLowerCase().includes(searchLower) ||
      customer.city?.toLowerCase().includes(searchLower) ||
      customer.country?.toLowerCase().includes(searchLower)
    );
  });
}
