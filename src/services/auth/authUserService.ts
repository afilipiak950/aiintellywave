
import { supabase } from '../../integrations/supabase/client';
import { AuthUser } from '../types/customerTypes';
import { handleAuthError } from './utils/errorHandler';

export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('fetchAuthUsers: Starting to fetch all auth users...');
    
    // First try: Admin API with even larger page size
    const { data: adminUsers, error: adminError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 2000 // Very large page size to ensure we get all users
    });
    
    if (!adminError && adminUsers?.users && adminUsers.users.length > 0) {
      console.log(`fetchAuthUsers: Successfully fetched ${adminUsers.users.length} users via admin API`);
      return adminUsers.users;
    }
    
    if (adminError) {
      console.error('fetchAuthUsers: Error using admin API:', adminError);
    }
    
    // Second try: Direct query to company_users table
    console.log('fetchAuthUsers: Falling back to company_users table');
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('*');
    
    if (companyError) {
      console.error('fetchAuthUsers: Error fetching from company_users:', companyError);
      throw companyError;
    }
    
    if (companyUsers && companyUsers.length > 0) {
      console.log(`fetchAuthUsers: Found ${companyUsers.length} users in company_users table`);
      
      // Transform company_users format to match AuthUser format
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
      
      return transformedUsers;
    }
    
    // Third try: Profiles table as last resort
    console.log('fetchAuthUsers: Attempting final fallback to profiles table');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('fetchAuthUsers: Error fetching from profiles:', profilesError);
      throw profilesError;
    }
    
    if (profiles && profiles.length > 0) {
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
    
    // If we get here, we couldn't find any users
    console.warn('fetchAuthUsers: No users found through any method');
    return [];
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
