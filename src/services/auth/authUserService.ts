
import { supabase } from '../../integrations/supabase/client';
import { AuthUser } from '../types/customerTypes';
import { handleAuthError } from './utils/errorHandler';

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('fetchAuthUsers: Starting to fetch all auth users with improved approach');
    
    // Try admin API with larger page size
    const { data: adminUsers, error: adminError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100 // Significantly increase page size to ensure we get all users
    });
    
    if (!adminError && adminUsers?.users && adminUsers.users.length > 0) {
      console.log(`fetchAuthUsers: Successfully fetched ${adminUsers.users.length} users via admin API`);
      return adminUsers.users;
    }
    
    if (adminError) {
      console.error('fetchAuthUsers: Error using admin API:', adminError);
    }
    
    // Fallback method: try to get users from company_users table
    console.log('fetchAuthUsers: Trying to fetch users from company_users table');
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('user_id, email, full_name, role, avatar_url');
    
    if (companyError) {
      console.error('fetchAuthUsers: Error fetching from company_users:', companyError);
      throw companyError;
    }
    
    if (!companyUsers || companyUsers.length === 0) {
      console.warn('fetchAuthUsers: No users found in company_users table');
      return [];
    }
    
    console.log(`fetchAuthUsers: Found ${companyUsers.length} users in company_users table`);
    
    // Convert company_users to AuthUser format
    const transformedUsers: AuthUser[] = companyUsers.map(user => ({
      id: user.user_id,
      email: user.email || '',
      user_metadata: {
        full_name: user.full_name,
        avatar_url: user.avatar_url
      },
      app_metadata: {
        role: user.role
      }
    }));
    
    return transformedUsers;
  } catch (error: any) {
    handleAuthError(error, 'fetchAuthUsers');
    return [];
  }
}

// Helper function to extract unique users from multiple data sources
export function getUniqueUsers(userArrays: AuthUser[][]): AuthUser[] {
  const uniqueUsersMap = new Map<string, AuthUser>();
  
  // Process all user arrays
  userArrays.forEach(userArray => {
    userArray.forEach(user => {
      if (user && user.id && !uniqueUsersMap.has(user.id)) {
        uniqueUsersMap.set(user.id, user);
      }
    });
  });
  
  return Array.from(uniqueUsersMap.values());
}
