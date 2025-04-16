
import { supabase } from '../../integrations/supabase/client';
import { AuthUser } from '../types/customerTypes';
import { handleAuthError } from './utils/errorHandler';

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('fetchAuthUsers: Starting to fetch all auth users with comprehensive strategy...');
    
    // Collect all users from multiple sources for maximum data coverage
    let allUsers: AuthUser[] = [];
    
    // STRATEGY 1: Admin API with large page size
    try {
      console.log('fetchAuthUsers Strategy 1: Using admin.listUsers API with large page size');
      const { data: adminUsers, error: adminError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 5000 // Very large page size to ensure we get all users
      });
      
      if (!adminError && adminUsers?.users && adminUsers.users.length > 0) {
        console.log(`fetchAuthUsers Strategy 1: Successfully fetched ${adminUsers.users.length} users via admin API`);
        allUsers = [...adminUsers.users];
      } else if (adminError) {
        console.warn('fetchAuthUsers Strategy 1: Error using admin API:', adminError);
      }
    } catch (adminError) {
      console.warn('fetchAuthUsers Strategy 1: Exception in admin API call:', adminError);
    }
    
    // STRATEGY 2: Direct query to user_roles table
    try {
      console.log('fetchAuthUsers Strategy 2: Querying user_roles table');
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (!userRolesError && userRoles && userRoles.length > 0) {
        console.log(`fetchAuthUsers Strategy 2: Found ${userRoles.length} user roles`);
        
        // For each user_id found in user_roles but not in allUsers yet, add a minimal record
        userRoles.forEach(roleRecord => {
          if (!allUsers.some(user => user.id === roleRecord.user_id)) {
            allUsers.push({
              id: roleRecord.user_id,
              role: roleRecord.role,
              email: '', // We'll try to fill this from other sources
              user_metadata: {}
            });
          }
        });
        
        console.log(`fetchAuthUsers Strategy 2: After adding user_roles, we now have ${allUsers.length} users`);
      } else if (userRolesError) {
        console.warn('fetchAuthUsers Strategy 2: Error querying user_roles:', userRolesError);
      }
    } catch (roleError) {
      console.warn('fetchAuthUsers Strategy 2: Exception querying user_roles:', roleError);
    }
    
    // STRATEGY 3: Query company_users table
    try {
      console.log('fetchAuthUsers Strategy 3: Querying company_users table');
      const { data: companyUsers, error: companyError } = await supabase
        .from('company_users')
        .select('*');
      
      if (!companyError && companyUsers && companyUsers.length > 0) {
        console.log(`fetchAuthUsers Strategy 3: Found ${companyUsers.length} company users`);
        
        // Update existing users with company_users data or add new ones
        companyUsers.forEach(companyUser => {
          const existingUserIndex = allUsers.findIndex(user => user.id === companyUser.user_id);
          
          if (existingUserIndex >= 0) {
            // Update existing user with company info
            allUsers[existingUserIndex] = {
              ...allUsers[existingUserIndex],
              email: allUsers[existingUserIndex].email || companyUser.email,
              role: allUsers[existingUserIndex].role || companyUser.role,
              company_id: companyUser.company_id,
              user_metadata: {
                ...allUsers[existingUserIndex].user_metadata,
                full_name: companyUser.full_name,
                first_name: companyUser.first_name,
                last_name: companyUser.last_name,
                avatar_url: companyUser.avatar_url
              }
            };
          } else {
            // Add new user from company_users
            allUsers.push({
              id: companyUser.user_id,
              email: companyUser.email || '',
              role: companyUser.role,
              company_id: companyUser.company_id,
              user_metadata: {
                full_name: companyUser.full_name,
                first_name: companyUser.first_name,
                last_name: companyUser.last_name,
                avatar_url: companyUser.avatar_url
              }
            });
          }
        });
        
        console.log(`fetchAuthUsers Strategy 3: After adding company_users, we now have ${allUsers.length} users`);
      } else if (companyError) {
        console.warn('fetchAuthUsers Strategy 3: Error querying company_users:', companyError);
      }
    } catch (companyError) {
      console.warn('fetchAuthUsers Strategy 3: Exception querying company_users:', companyError);
    }
    
    // STRATEGY 4: Query profiles table as last resort
    try {
      console.log('fetchAuthUsers Strategy 4: Querying profiles table');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (!profilesError && profiles && profiles.length > 0) {
        console.log(`fetchAuthUsers Strategy 4: Found ${profiles.length} profiles`);
        
        // Update existing users with profiles data or add new ones
        profiles.forEach(profile => {
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
            allUsers.push({
              id: profile.id,
              email: '',
              user_metadata: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                avatar_url: profile.avatar_url,
                full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
              }
            });
          }
        });
        
        console.log(`fetchAuthUsers Strategy 4: After adding profiles, we now have ${allUsers.length} users`);
      } else if (profilesError) {
        console.warn('fetchAuthUsers Strategy 4: Error querying profiles:', profilesError);
      }
    } catch (profileError) {
      console.warn('fetchAuthUsers Strategy 4: Exception querying profiles:', profileError);
    }
    
    // If we found no users from any method, try one last approach - direct SQL query
    if (allUsers.length === 0) {
      try {
        console.log('fetchAuthUsers EMERGENCY: Attempting to use RPC function');
        // Try to use a special function that might bypass RLS
        const { data: directUsers, error: directError } = await supabase.rpc('get_all_users');
        
        if (!directError && directUsers && directUsers.length > 0) {
          console.log(`fetchAuthUsers EMERGENCY: Found ${directUsers.length} users via direct SQL`);
          allUsers = directUsers;
        } else if (directError) {
          console.error('fetchAuthUsers EMERGENCY: Direct SQL approach failed:', directError);
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
