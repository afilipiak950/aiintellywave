
import { Customer } from '../types';
import { UICustomer, AssociatedCompany } from '@/types/customer';

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
      status: 'active',
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
      user_id: user.user_id, // Added user_id to differentiate users from companies
      name: name,
      email: user.email || '',
      company: companyName,
      company_name: companyName,
      company_id: companyId,
      status: 'active',
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
