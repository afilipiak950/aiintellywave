
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { AuthUser } from '../types/customerTypes';

// Function to fetch all users from auth.users table
export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('Fetching auth users data...');
    
    // Approach 1: Try to get auth users directly using admin API - this should match the users shown in the screenshot
    try {
      console.log('Attempting direct auth users fetch via admin API');
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Fetch more users per page to get all users
      });
      
      if (!authUsersError && authUsers?.users?.length > 0) {
        console.log('Auth users fetched directly:', authUsers.users.length);
        
        // Transform the data to match our AuthUser interface
        const formattedUsers: AuthUser[] = authUsers.users.map((user) => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || '',
          app_metadata: user.app_metadata || {},
          user_metadata: user.user_metadata || {},
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 
                   `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                   user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || ''
        }));
        
        console.log(`Formatted ${formattedUsers.length} auth users successfully`);
        return formattedUsers;
      } else if (authUsersError) {
        console.warn('Error fetching via admin API:', authUsersError.message);
      } else {
        console.warn('No users found via admin API');
      }
    } catch (directAuthError: any) {
      console.warn('Could not fetch auth users directly:', directAuthError.message);
      // Continue to fallback method
    }
    
    // Approach 2: Try fetching from user_roles table to get all users with roles
    console.log('Attempting to fetch from user_roles table');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
      
    if (!userRolesError && userRoles && userRoles.length > 0) {
      console.log('Found users in user_roles table:', userRoles.length);
      
      // Collect all user IDs to fetch their details
      const userIds = userRoles.map(ur => ur.user_id);
      
      // Get user details from company_users
      const { data: companyUsersData, error: companyUsersError } = await supabase
        .from('company_users')
        .select('*')
        .in('user_id', userIds);
        
      if (companyUsersError) {
        console.warn('Error fetching company_users:', companyUsersError.message);
      }
      
      // Get profile data for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError.message);
      }
      
      // Combine data from both sources
      const userRoleMap = new Map(userRoles.map(ur => [ur.user_id, ur.role]));
      const companyUsersMap = new Map(
        (companyUsersData || []).map(cu => [cu.user_id, cu])
      );
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, p])
      );
      
      // Create combined user records
      const combinedUsers: AuthUser[] = userIds.map(userId => {
        const companyUser = companyUsersMap.get(userId) || {};
        const profile = profilesMap.get(userId) || {};
        const role = userRoleMap.get(userId) || 'customer';
        
        return {
          id: userId,
          email: (companyUser as any).email || '',
          created_at: (companyUser as any).created_at || (profile as any).created_at || '',
          last_sign_in_at: (companyUser as any).last_sign_in_at || '',
          role: role,
          first_name: (companyUser as any).first_name || (profile as any).first_name || '',
          last_name: (companyUser as any).last_name || (profile as any).last_name || '',
          avatar_url: (companyUser as any).avatar_url || (profile as any).avatar_url || '',
          user_metadata: {
            first_name: (companyUser as any).first_name || (profile as any).first_name || '',
            last_name: (companyUser as any).last_name || (profile as any).last_name || '',
            name: (companyUser as any).full_name || 
                 `${(profile as any).first_name || ''} ${(profile as any).last_name || ''}`.trim() || 
                 'User',
            role: role
          }
        };
      });
      
      console.log(`Combined data for ${combinedUsers.length} users from user_roles`);
      return combinedUsers;
    } else if (userRolesError) {
      console.warn('Error fetching from user_roles:', userRolesError.message);
    }
    
    // Approach 3: Try a direct query to auth.users table using service role (if available)
    try {
      console.log('Attempting direct query to auth.users table with service role');
      const { data: authUsersRaw, error: authQueryError } = await supabase.rpc('get_all_auth_users');
      
      if (!authQueryError && authUsersRaw && authUsersRaw.length > 0) {
        console.log('Users fetched via direct auth.users query:', authUsersRaw.length);
        
        // Transform the data to match our AuthUser interface
        const usersList: AuthUser[] = authUsersRaw.map((user: any) => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || '',
          user_metadata: user.raw_user_meta_data || {},
          app_metadata: user.raw_app_meta_data || {},
          first_name: user.raw_user_meta_data?.first_name || '',
          last_name: user.raw_user_meta_data?.last_name || '',
          full_name: user.raw_user_meta_data?.name || 
                   `${user.raw_user_meta_data?.first_name || ''} ${user.raw_user_meta_data?.last_name || ''}`.trim() || 
                   user.email?.split('@')[0] || 'User'
        }));
        
        return usersList;
      } else if (authQueryError) {
        console.warn('Error with direct auth users query:', authQueryError.message);
      }
    } catch (authQueryError: any) {
      console.warn('Could not query auth.users directly:', authQueryError.message);
    }
    
    // Approach 4: Fallback to company_users table
    console.log('Attempting to fetch from company_users table');
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('*');
      
    if (companyError) {
      console.error('Error fetching from company_users:', companyError.message);
      throw companyError;
    }
    
    if (!companyUsers || companyUsers.length === 0) {
      console.warn('No users found in company_users table, trying profiles table');
      
      // Approach 5: Try profiles as a last resort
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching from profiles:', profilesError.message);
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        console.warn('No users found in any table');
        return [];
      }
      
      console.log('Users fetched from profiles:', profiles.length);
      
      // Transform profiles to AuthUser format
      const profileUsers: AuthUser[] = profiles.map((profile: any) => ({
        id: profile.id,
        email: '', // No email in profiles
        created_at: profile.created_at || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        user_metadata: {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
        }
      }));
      
      return profileUsers;
    }
    
    console.log('Users fetched from company_users:', companyUsers.length);
    
    // Transform company_users to AuthUser format
    const companyAuthUsers: AuthUser[] = companyUsers.map((user: any) => ({
      id: user.user_id,
      email: user.email || '',
      created_at: user.created_at_auth || user.created_at || '',
      last_sign_in_at: user.last_sign_in_at || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      avatar_url: user.avatar_url || '',
      role: user.role || 'customer',
      user_metadata: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        role: user.role || 'customer'
      }
    }));
    
    return companyAuthUsers;
  } catch (error: any) {
    console.error('Error fetching auth users:', error);
    const errorMsg = error.code 
      ? `Database error (${error.code}): ${error.message}`
      : error.message 
        ? `Error: ${error.message}`
        : 'Failed to load auth users. Please try again.';
    
    toast({
      title: "Error",
      description: errorMsg,
      variant: "destructive"
    });
    
    return [];
  }
}
