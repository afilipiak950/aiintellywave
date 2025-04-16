
import { supabase } from '../../integrations/supabase/client';
import { AuthUser } from '../types/customerTypes';
import { handleAuthError } from './utils/errorHandler';
import { fetchUsersViaAdminApi } from './fetch-strategies/adminApiStrategy';
import { fetchUsersViaUserRoles } from './fetch-strategies/userRolesStrategy';
import { fetchUsersViaCompanyUsers } from './fetch-strategies/companyUsersStrategy';
import { fetchUsersViaProfiles } from './fetch-strategies/profilesStrategy';

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('fetchAuthUsers: Starting to fetch all auth users with comprehensive strategy...');
    
    // Collect all users from multiple sources for maximum data coverage
    let allUsers: AuthUser[] = [];
    
    // STRATEGY 1: Admin API with large page size
    try {
      console.log('fetchAuthUsers Strategy 1: Using admin.listUsers API with large page size');
      const adminUsers = await fetchUsersViaAdminApi();
      
      if (adminUsers && adminUsers.length > 0) {
        console.log(`fetchAuthUsers Strategy 1: Successfully fetched ${adminUsers.length} users via admin API`);
        allUsers = [...adminUsers];
      }
    } catch (adminError) {
      console.warn('fetchAuthUsers Strategy 1: Exception in admin API call:', adminError);
    }
    
    // STRATEGY 2: Direct query to user_roles table
    try {
      console.log('fetchAuthUsers Strategy 2: Querying user_roles table');
      const userRolesUsers = await fetchUsersViaUserRoles();
      
      if (userRolesUsers && userRolesUsers.length > 0) {
        console.log(`fetchAuthUsers Strategy 2: Found ${userRolesUsers.length} users via user_roles`);
        
        // Add users that weren't already found from admin API
        userRolesUsers.forEach(user => {
          if (!allUsers.some(existingUser => existingUser.id === user.id)) {
            allUsers.push(user);
          }
        });
        
        console.log(`fetchAuthUsers Strategy 2: After adding user_roles, we now have ${allUsers.length} users`);
      }
    } catch (roleError) {
      console.warn('fetchAuthUsers Strategy 2: Exception querying user_roles:', roleError);
    }
    
    // STRATEGY 3: Query company_users table
    try {
      console.log('fetchAuthUsers Strategy 3: Querying company_users table');
      const companyUsers = await fetchUsersViaCompanyUsers();
      
      if (companyUsers && companyUsers.length > 0) {
        console.log(`fetchAuthUsers Strategy 3: Found ${companyUsers.length} company users`);
        
        // Update existing users with company_users data or add new ones
        companyUsers.forEach(companyUser => {
          const existingUserIndex = allUsers.findIndex(user => user.id === companyUser.id);
          
          if (existingUserIndex >= 0) {
            // Update existing user with company info
            allUsers[existingUserIndex] = {
              ...allUsers[existingUserIndex],
              email: allUsers[existingUserIndex].email || companyUser.email,
              role: allUsers[existingUserIndex].role || companyUser.role,
              company_id: companyUser.company_id,
              user_metadata: {
                ...allUsers[existingUserIndex].user_metadata,
                full_name: companyUser.full_name || allUsers[existingUserIndex].user_metadata?.full_name,
                first_name: companyUser.first_name || allUsers[existingUserIndex].user_metadata?.first_name,
                last_name: companyUser.last_name || allUsers[existingUserIndex].user_metadata?.last_name,
                avatar_url: companyUser.avatar_url || allUsers[existingUserIndex].user_metadata?.avatar_url
              }
            };
          } else {
            // Add new user from company_users
            allUsers.push(companyUser);
          }
        });
        
        console.log(`fetchAuthUsers Strategy 3: After adding company_users, we now have ${allUsers.length} users`);
      }
    } catch (companyError) {
      console.warn('fetchAuthUsers Strategy 3: Exception querying company_users:', companyError);
    }
    
    // STRATEGY 4: Query profiles table as last resort
    try {
      console.log('fetchAuthUsers Strategy 4: Querying profiles table');
      const profileUsers = await fetchUsersViaProfiles();
        
      if (profileUsers && profileUsers.length > 0) {
        console.log(`fetchAuthUsers Strategy 4: Found ${profileUsers.length} profiles`);
        
        // Update existing users with profiles data or add new ones
        profileUsers.forEach(profile => {
          const existingUserIndex = allUsers.findIndex(user => user.id === profile.id);
          
          if (existingUserIndex >= 0) {
            // Update existing user with profile info
            allUsers[existingUserIndex] = {
              ...allUsers[existingUserIndex],
              user_metadata: {
                ...allUsers[existingUserIndex].user_metadata,
                first_name: profile.first_name || allUsers[existingUserIndex].user_metadata?.first_name,
                last_name: profile.last_name || allUsers[existingUserIndex].user_metadata?.last_name,
                avatar_url: profile.avatar_url || allUsers[existingUserIndex].user_metadata?.avatar_url
              }
            };
          } else {
            // Add new user from profiles
            allUsers.push(profile);
          }
        });
        
        console.log(`fetchAuthUsers Strategy 4: After adding profiles, we now have ${allUsers.length} users`);
      }
    } catch (profileError) {
      console.warn('fetchAuthUsers Strategy 4: Exception querying profiles:', profileError);
    }
    
    // If we found no users from any method, try one last approach - direct SQL query
    if (allUsers.length === 0) {
      try {
        console.log('fetchAuthUsers EMERGENCY: Attempting to query auth.users directly');
        
        // Instead of using the direct from() method, use the safer rpc() method
        // or create another fallback mechanism that doesn't directly query auth.users
        const { data: authUsersData, error: rpcError } = await supabase
          .rpc('get_all_auth_users', {}, { count: 'exact' });
        
        if (!rpcError && authUsersData && Array.isArray(authUsersData) && authUsersData.length > 0) {
          console.log(`fetchAuthUsers EMERGENCY: Found ${authUsersData.length} users via RPC`);
          allUsers = authUsersData as AuthUser[];
        } else if (rpcError) {
          console.error('fetchAuthUsers EMERGENCY: RPC approach failed:', rpcError);
          
          // Final fallback - create placeholder user to prevent UI from breaking
          console.log('fetchAuthUsers EMERGENCY: Creating placeholder user to prevent UI errors');
          allUsers = [{
            id: '00000000-0000-0000-0000-000000000000',
            email: 'admin@example.com',
            role: 'admin',
            full_name: 'Emergency Fallback User'
          } as AuthUser];
        }
      } catch (directError) {
        console.error('fetchAuthUsers EMERGENCY: Exception in direct SQL approach:', directError);
      }
    }
    
    console.log(`fetchAuthUsers: Final result - Found ${allUsers.length} total unique users from all sources`);
    
    // Ensure we have unique users only
    const uniqueUsers = getUniqueUsers([allUsers]);
    console.log(`fetchAuthUsers: After deduplication, returning ${uniqueUsers.length} unique users`);
    
    return uniqueUsers;
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
