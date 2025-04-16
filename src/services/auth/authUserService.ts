
import { supabase } from '../../integrations/supabase/client';
import { AuthUser } from '../types/customerTypes';
import { handleAuthError } from './utils/errorHandler';

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('fetchAuthUsers: Starting to fetch all auth users with comprehensive approach');
    
    // APPROACH 1: Try admin API with larger page size first
    const { data: adminUsers, error: adminError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Significantly increased to ensure we get all users
    });
    
    if (!adminError && adminUsers?.users && adminUsers.users.length > 0) {
      console.log(`fetchAuthUsers: Successfully fetched ${adminUsers.users.length} users via admin API`);
      return adminUsers.users;
    }
    
    if (adminError) {
      console.error('fetchAuthUsers: Error using admin API:', adminError);
    }
    
    // APPROACH 2: Try a different method with the admin API
    try {
      console.log('fetchAuthUsers: Trying alternative admin API approach...');
      const altAdminResponse = await fetch('https://ootziscicbahucatxyme.supabase.co/auth/v1/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (altAdminResponse.ok) {
        const users = await altAdminResponse.json();
        if (users && users.length > 0) {
          console.log(`fetchAuthUsers: Alternative admin API returned ${users.length} users`);
          return users;
        }
      }
    } catch (altError) {
      console.error('fetchAuthUsers: Alternative admin API approach failed:', altError);
    }
    
    // APPROACH 3: Fallback to company_users table
    console.log('fetchAuthUsers: Falling back to company_users table');
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('user_id, email, full_name, first_name, last_name, role, avatar_url, company_id');
    
    if (companyError) {
      console.error('fetchAuthUsers: Error fetching from company_users:', companyError);
      throw companyError;
    }
    
    if (!companyUsers || companyUsers.length === 0) {
      console.warn('fetchAuthUsers: No users found in company_users table');
      
      // APPROACH 4: Last resort - try user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        console.error('fetchAuthUsers: Error fetching from user_roles:', rolesError);
        throw rolesError;
      }
      
      if (!userRoles || userRoles.length === 0) {
        console.warn('fetchAuthUsers: No users found in user_roles table');
        return [];
      }
      
      // Convert user_roles to AuthUser format as a last resort
      const transformedRoles: AuthUser[] = userRoles.map(user => ({
        id: user.user_id,
        email: '', // We don't have emails from user_roles
        user_metadata: {},
        app_metadata: {
          role: user.role
        }
      }));
      
      console.log(`fetchAuthUsers: Transformed ${transformedRoles.length} users from user_roles table`);
      return transformedRoles;
    }
    
    console.log(`fetchAuthUsers: Found ${companyUsers.length} users in company_users table`);
    
    // Convert company_users to AuthUser format
    const transformedUsers: AuthUser[] = companyUsers.map(user => ({
      id: user.user_id,
      email: user.email || '',
      user_metadata: {
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url
      },
      app_metadata: {
        role: user.role
      },
      company_id: user.company_id
    }));
    
    console.log(`fetchAuthUsers: Transformed ${transformedUsers.length} users from company_users`);
    return transformedUsers;
  } catch (error: any) {
    handleAuthError(error, 'fetchAuthUsers');
    
    // Even in case of error, try one more approach as last resort
    try {
      console.log('fetchAuthUsers: Attempting FINAL fallback to profiles table');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url');
        
      if (!profilesError && profiles && profiles.length > 0) {
        console.log(`fetchAuthUsers: Found ${profiles.length} profiles as last resort`);
        return profiles.map(profile => ({
          id: profile.id,
          email: '',
          user_metadata: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          },
          app_metadata: {}
        }));
      }
    } catch (lastError) {
      console.error('fetchAuthUsers: Final fallback failed:', lastError);
    }
    
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
