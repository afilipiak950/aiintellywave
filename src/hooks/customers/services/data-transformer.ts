
import { Customer } from '../types';
import { formatCompanyDataToCustomers, formatCompanyUsersToCustomers } from '../utils';

/**
 * Transform raw database data into Customer objects
 */
export function transformCustomerData(
  companiesData: any[], 
  companyUsersData: any[]
): Customer[] {
  console.log('Companies data received:', companiesData.length);
  console.log('Company users data received:', companyUsersData.length);
  
  // Format the data to match the Customer interface
  const companiesCustomers = formatCompanyDataToCustomers(companiesData);
  const usersCustomers = formatCompanyUsersToCustomers(companyUsersData);
  
  // Combine both types of customers, removing duplicates
  const combinedCustomers = [...companiesCustomers];
  
  // Add individual users as customers, avoiding duplicates
  usersCustomers.forEach(userCustomer => {
    if (!combinedCustomers.some(c => c.id === userCustomer.id)) {
      combinedCustomers.push(userCustomer);
    }
  });
  
  console.log('Final customers count:', combinedCustomers.length);
  return combinedCustomers;
}
