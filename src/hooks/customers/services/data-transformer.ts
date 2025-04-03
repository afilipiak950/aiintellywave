
import { Customer } from '../types';

/**
 * Transform raw database data into Customer objects
 */
export function transformCustomerData(companiesData: any[], companyUsersData: any[]): Customer[] {
  console.log('Formatting company data to customers:', companiesData?.length, 'companies');
  console.log('Formatting company users to customers:', companyUsersData?.length, 'users');
  
  const result: Customer[] = [];
  
  // Add companies as customers (for admin/management view)
  if (companiesData && companiesData.length > 0) {
    companiesData.forEach(company => {
      result.push({
        id: company.id,
        company_id: company.id,
        company_name: company.name,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        city: company.city,
        country: company.country,
        status: 'active'
      });
    });
  }
  
  // Add company users as customers
  if (companyUsersData && companyUsersData.length > 0) {
    companyUsersData.forEach(user => {
      // Find company info
      let companyInfo = { name: '', city: '', country: '', contact_email: '', contact_phone: '' };
      
      // If companies data is nested in the user object
      if (user.companies) {
        companyInfo = {
          name: user.companies.name || '',
          city: user.companies.city || '',
          country: user.companies.country || '',
          contact_email: user.companies.contact_email || '',
          contact_phone: user.companies.contact_phone || ''
        };
      }
      
      // Construct customer object from user data
      result.push({
        id: user.user_id,
        user_id: user.user_id,
        email: user.email || '',
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        company_id: user.company_id,
        company_name: companyInfo.name,
        role: user.role || '',
        company_role: user.role || '',
        is_admin: user.is_admin || false,
        avatar_url: user.avatar_url || '',
        city: companyInfo.city,
        country: companyInfo.country,
        contact_email: user.email || companyInfo.contact_email,
        contact_phone: companyInfo.contact_phone,
        status: 'active' // Default status
      });
    });
  }
  
  console.log('Final customers count:', result.length);
  return result;
}
