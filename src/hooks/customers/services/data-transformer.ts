import { Customer } from '../types';

/**
 * Transforms raw company and user data into Customer objects
 */
export function transformCustomerData(
  companiesData: any[],
  companyUsersData: any[]
): Customer[] {
  console.log('Transforming customer data from', companiesData?.length || 0, 'companies and', companyUsersData?.length || 0, 'company users');
  
  // Create a map of companies by ID for quick lookup
  const companiesMap = new Map();
  companiesData?.forEach(company => {
    if (company.id) {
      companiesMap.set(company.id, company);
    }
  });
  
  // Group users by their user_id to collect all company associations
  const userCompanies = new Map();
  companyUsersData?.forEach(companyUser => {
    if (!companyUser.user_id) return;
    
    // If this is the first time we're seeing this user, initialize the array
    if (!userCompanies.has(companyUser.user_id)) {
      userCompanies.set(companyUser.user_id, []);
    }
    
    // Get the company details from our map
    const company = companiesMap.get(companyUser.company_id);
    
    // Add this company association to the user's list
    userCompanies.get(companyUser.user_id).push({
      id: companyUser.id || companyUser.company_id,
      name: company?.name || '',
      company_id: companyUser.company_id,
      company_name: company?.name || '',
      role: companyUser.role || 'customer',
      is_primary: companyUser.is_primary_company || false
    });
  });
  
  // Create a customer object for each user, using their primary company info
  // but also including all associated companies
  const customers: Customer[] = [];
  companyUsersData?.forEach(companyUser => {
    if (!companyUser.user_id) return;
    
    // Get all company associations for this user
    const associations = userCompanies.get(companyUser.user_id) || [];
    
    // Find primary company (marked as primary or first in list if none marked)
    const primaryAssociation = associations.find(a => a.is_primary) || associations[0];
    
    // If we already processed this user, skip
    if (customers.some(c => c.id === companyUser.user_id)) {
      return;
    }
    
    // Get company details
    const company = primaryAssociation 
      ? companiesMap.get(primaryAssociation.company_id) 
      : companiesMap.get(companyUser.company_id);
    
    if (!company) {
      console.warn('Company not found for user', companyUser.user_id);
      return;
    }
    
    // Create the customer object using primary company details
    const fullName = companyUser.full_name || 
                     `${companyUser.first_name || ''} ${companyUser.last_name || ''}`.trim() || 
                     'Unnamed User';
    
    const customer: Customer = {
      id: companyUser.user_id,
      user_id: companyUser.user_id,
      email: companyUser.email || company.contact_email || '',
      first_name: companyUser.first_name || '',
      last_name: companyUser.last_name || '',
      full_name: companyUser.full_name || `${companyUser.first_name || ''} ${companyUser.last_name || ''}`.trim() || 'Unnamed User',
      name: fullName, // Ensure name is always set
      company_id: company.id,
      company_name: company.name,
      company: company.name,
      role: primaryAssociation?.role || companyUser.role || 'customer',
      company_role: primaryAssociation?.role || companyUser.role || 'customer',
      is_admin: companyUser.is_admin || false,
      avatar_url: companyUser.avatar_url || '',
      avatar: companyUser.avatar_url || '',
      phone: companyUser.phone || '',
      position: companyUser.position || '',
      city: company.city || '',
      country: company.country || '',
      contact_email: company.contact_email || companyUser.email || '',
      contact_phone: company.contact_phone || companyUser.phone || '',
      status: 'active', // Always set as 'active' for UICustomer compatibility
      notes: '', // Add empty notes for consistency
      // Store all company associations, marking primary one
      associated_companies: associations
    };
    
    customers.push(customer);
  });
  
  console.log('Transformed', customers.length, 'customers with associated companies');
  return customers;
}
