
import { Customer } from '../types';
import { formatCompanyDataToCustomers, formatCompanyUsersToCustomers, formatAuthUsersToCustomers } from '../utils';

/**
 * Transform raw database data into Customer objects
 */
export function transformCustomerData(
  companiesData: any[], 
  companyUsersData: any[],
  authUsersData: any[] = []
): Customer[] {
  console.log('Companies data received:', companiesData.length);
  console.log('Company users data received:', companyUsersData.length);
  console.log('Auth users data received:', authUsersData.length || 0);
  
  // Format the data to match the Customer interface
  const companiesCustomers = formatCompanyDataToCustomers(companiesData);
  const usersCustomers = formatCompanyUsersToCustomers(companyUsersData);
  let authCustomers: Customer[] = [];
  
  if (authUsersData && authUsersData.length > 0) {
    authCustomers = formatAuthUsersToCustomers(authUsersData);
  }
  
  // Combine all types of customers, removing duplicates
  const combinedCustomers = [...companiesCustomers];
  
  // Add individual users as customers, avoiding duplicates
  usersCustomers.forEach(userCustomer => {
    if (!combinedCustomers.some(c => c.id === userCustomer.id)) {
      combinedCustomers.push(userCustomer);
    }
  });
  
  // Add auth users that aren't already in the list
  authCustomers.forEach(authCustomer => {
    if (!combinedCustomers.some(c => c.id === authCustomer.id)) {
      combinedCustomers.push(authCustomer);
    }
  });
  
  console.log('Final customers count:', combinedCustomers.length);
  return combinedCustomers;
}
