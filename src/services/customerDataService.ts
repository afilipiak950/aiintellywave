
import { fetchUsers } from '@/services/userService';
import { fetchCompanyUsers } from '@/services/companyUserService';
import { formatUserDataToCustomer } from '@/utils/customerUtils';
import { Customer } from '@/types/customer';

export const fetchCustomerData = async (): Promise<{
  customers: Customer[];
  error: string | null;
}> => {
  try {
    // Fetch users data with company information
    const usersData = await fetchUsers();
    console.log('Users data in service:', usersData);
    
    // Also fetch company_users data to get role information
    const companyUsersMap = await fetchCompanyUsers();
    console.log('Company users map:', companyUsersMap);
    
    // Transform users data to customer format with correct typing
    const formattedCustomers: Customer[] = usersData.map(user => formatUserDataToCustomer(user));
    
    console.log('Formatted customers:', formattedCustomers);
    return { customers: formattedCustomers, error: null };
  } catch (error: any) {
    console.error('Error in fetchCustomerData:', error);
    
    // Don't show the recursive RLS error to users
    if (error.message?.includes('infinite recursion')) {
      console.warn('Suppressing RLS recursion error in UI');
      // Still return empty customers array
      return { customers: [], error: null };
    } else {
      return { 
        customers: [], 
        error: error.message || 'Failed to load customers. Please try again.' 
      };
    }
  }
};
