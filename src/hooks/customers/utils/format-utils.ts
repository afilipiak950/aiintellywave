
import { Customer } from '../types';

/**
 * Format company data from the database into Customer objects
 */
export function formatCompanyDataToCustomers(companiesData: any[]): Customer[] {
  console.log('Formatting company data to customers:', companiesData.length, 'companies');
  
  return companiesData.map(company => ({
    id: company.id,
    name: company.name || '',
    company: company.name || '',
    company_name: company.name || '',
    company_id: company.id || '',
    email: company.contact_email || '',
    contact_email: company.contact_email || '',
    contact_phone: company.contact_phone || '',
    phone: company.contact_phone || '',
    status: 'active',
    description: company.description || '',
    address: company.address || '',
    city: company.city || '',
    country: company.country || '',
    website: company.website || '',
    industry: company.industry || '',
  }));
}

/**
 * Format company users data from the database into Customer objects
 */
export function formatCompanyUsersToCustomers(companyUsersData: any[]): Customer[] {
  console.log('Formatting company users to customers:', companyUsersData.length, 'users');
  
  return companyUsersData.map(user => {
    // Get company data if available
    const company = user.companies || {};
    
    // Create a name from various sources
    let name = user.full_name || '';
    if (!name && (user.first_name || user.last_name)) {
      name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (!name) {
      name = user.email || 'Unnamed User';
    }
    
    return {
      id: user.user_id,
      user_id: user.user_id,
      name: name,
      full_name: name,
      email: user.email || '',
      phone: '', // Usually not available from company_users
      status: 'active',
      role: user.role || '',
      company_role: user.role || '',
      is_admin: user.is_admin || false,
      company: company.name || '',
      company_name: company.name || '',
      company_id: user.company_id || '',
      avatar_url: user.avatar_url || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      city: company.city || '',
      country: company.country || '',
      contact_email: user.email || company.contact_email || '',
    };
  });
}

/**
 * Format auth users data into Customer objects
 */
export function formatAuthUsersToCustomers(authUsersData: any[]): Customer[] {
  console.log('Formatting auth users to customers:', authUsersData.length, 'users');
  
  return authUsersData.map(authUser => {
    // Extract user metadata
    const metadata = authUser.user_metadata || {};
    
    // Create a name from various sources
    let name = metadata.full_name || metadata.name || '';
    if (!name && (metadata.first_name || metadata.last_name)) {
      name = `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim();
    }
    if (!name) {
      name = authUser.email || 'Unnamed User';
    }
    
    return {
      id: authUser.id,
      user_id: authUser.id,
      name: name,
      full_name: name,
      email: authUser.email || '',
      phone: metadata.phone || '',
      status: authUser.banned ? 'inactive' : 'active',
      role: metadata.role || '',
      company_role: metadata.role || '',
      is_admin: metadata.role === 'admin',
      company: metadata.company || '',
      company_name: metadata.company || '',
      company_id: metadata.company_id || '',
      avatar_url: metadata.avatar_url || '',
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      city: metadata.city || '',
      country: metadata.country || '',
      contact_email: authUser.email || ''
    };
  });
}
