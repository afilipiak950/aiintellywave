
import { Customer } from './types';
import { AssociatedCompany } from '@/types/customer';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Format company data to customers format
 */
export function formatCompanyDataToCustomers(companiesData: any[]): Customer[] {
  console.log('Formatting company data to customers:', companiesData.length, 'companies');
  return companiesData.map(company => {
    return {
      id: company.id,
      name: company.name || 'Unnamed Company',
      company: company.name,
      company_name: company.name,
      company_id: company.id,
      email: company.contact_email || '',
      contact_email: company.contact_email || '',
      phone: company.contact_phone || '',
      contact_phone: company.contact_phone || '',
      status: 'active' as 'active' | 'inactive',
      projects: 0,
      description: company.description,
      city: company.city,
      country: company.country
    };
  });
}

/**
 * Format user data from company_users to customer format
 */
export function formatCompanyUsersToCustomers(companyUsersData: any[]): Customer[] {
  console.log('Formatting company users to customers:', companyUsersData.length, 'users');
  return companyUsersData.map(user => {
    // Extract company data
    const company = user.companies || {};
    const companyId = user.company_id || '';
    const companyName = company.name || '';
    
    // Create associated company if company data is available
    let associatedCompanies: AssociatedCompany[] = [];
    if (companyId && companyName) {
      const associatedCompany: AssociatedCompany = {
        id: companyId,
        name: companyName,
        company_id: companyId,
        company_name: companyName,
        role: user.role || 'customer'
      };
      associatedCompanies = [associatedCompany];
    }
    
    const name = user.full_name || 
                 `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                 user.email || 
                 'Unknown User';
    
    return {
      id: user.user_id,
      name: name,
      email: user.email || '',
      company: companyName,
      company_name: companyName,
      company_id: companyId,
      status: 'active' as 'active' | 'inactive',
      phone: '',
      role: user.role || 'customer',
      company_role: user.role || 'customer',
      avatar: user.avatar_url || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      associated_companies: associatedCompanies
    };
  });
}

/**
 * Check if the current user is an admin
 */
export async function checkIsAdminUser(userId: string, userEmail?: string): Promise<boolean> {
  // Special case for admin@intellywave.de
  if (userEmail === 'admin@intellywave.de') {
    return true;
  }
  
  try {
    // Check user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (roleError) {
      console.error('Error checking admin role:', roleError);
    } else if (roleData && roleData.role === 'admin') {
      return true;
    }
    
    // Fallback to company_users table
    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_users')
      .select('role, is_admin')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (companyUserError) {
      console.error('Error checking company_users role:', companyUserError);
    } else if (companyUserData) {
      return companyUserData.is_admin || companyUserData.role === 'admin';
    }
    
    return false;
  } catch (error) {
    console.error('Error in checkIsAdminUser:', error);
    return false;
  }
}
