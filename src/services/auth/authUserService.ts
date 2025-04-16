
import { toast } from "../../hooks/use-toast";
import { AuthUser } from '../types/customerTypes';
import { fetchUsersViaAdminApi } from './fetch-strategies/adminApiStrategy';
import { fetchUsersViaUserRoles } from './fetch-strategies/userRolesStrategy';
import { fetchUsersViaCompanyUsers } from './fetch-strategies/companyUsersStrategy';
import { fetchUsersViaProfiles } from './fetch-strategies/profilesStrategy';
import { handleAuthError } from './utils/errorHandler';

/**
 * Fetches all users from auth.users table and related sources using multiple strategies
 * Will try different approaches in order of reliability
 */
export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('Fetching auth users data...');
    
    // Strategy 1: Try admin API approach (most reliable)
    const adminApiUsers = await fetchUsersViaAdminApi();
    if (adminApiUsers) {
      return adminApiUsers;
    }
    
    // Strategy 2: Try user_roles approach
    const userRolesUsers = await fetchUsersViaUserRoles();
    if (userRolesUsers) {
      return userRolesUsers;
    }
    
    // Strategy 3: Try company_users approach
    const companyUsersUsers = await fetchUsersViaCompanyUsers();
    if (companyUsersUsers) {
      return companyUsersUsers;
    }
    
    // Strategy 4: Try profiles approach as last resort
    const profilesUsers = await fetchUsersViaProfiles();
    if (profilesUsers) {
      return profilesUsers;
    }
    
    // If all strategies fail, return empty array
    console.error('All user fetching strategies failed');
    toast({
      title: "Error",
      description: "Failed to load users from any source. Please try again later.",
      variant: "destructive"
    });
    
    return [];
  } catch (error: any) {
    handleAuthError(error, 'fetchAuthUsers');
    return [];
  }
}
