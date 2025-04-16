
import { supabase } from '../../integrations/supabase/client';
import { handleAuthError } from '../auth/utils/errorHandler';
import { UserData } from '../types/customerTypes';
import { fetchAuthUsers } from '../auth/authUserService';

/**
 * Fetches specific user data by ID
 */
export async function fetchUserById(userId: string): Promise<UserData | null> {
  try {
    console.log(`Fetching user data for ID: ${userId}`);
    
    // Attempt to get user from company_users first
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        role,
        company_id,
        companies:company_id(id, name, contact_email, contact_phone)
      `)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (companyUserError) {
      console.warn(`Error fetching company user for ${userId}:`, companyUserError.message);
    }
    
    // Attempt to get user from auth.users
    let authUser = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (!authError && authData?.user) {
        authUser = authData.user;
      }
    } catch (authError) {
      console.warn(`Error fetching auth user for ${userId}:`, authError);
    }
    
    // Attempt to get user from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.warn(`Error fetching profile for ${userId}:`, profileError.message);
    }
    
    // Combine data sources with priority
    const userData: UserData = {
      user_id: userId,
      email: authUser?.email || companyUser?.email || '',
      full_name: authUser?.user_metadata?.full_name || companyUser?.full_name || 
                `${authUser?.user_metadata?.first_name || ''} ${authUser?.user_metadata?.last_name || ''}`.trim() ||
                `${companyUser?.first_name || ''} ${companyUser?.last_name || ''}`.trim() ||
                `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
      first_name: authUser?.user_metadata?.first_name || companyUser?.first_name || profile?.first_name || '',
      last_name: authUser?.user_metadata?.last_name || companyUser?.last_name || profile?.last_name || '',
      company_id: companyUser?.company_id || '',
      company_name: companyUser?.companies?.name || '',
      role: companyUser?.role || 'customer',
      avatar_url: authUser?.user_metadata?.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '',
      created_at: authUser?.created_at || profile?.created_at || '',
      last_sign_in_at: authUser?.last_sign_in_at || ''
    };
    
    return userData;
  } catch (error: any) {
    handleAuthError(error, `fetchUserById(${userId})`);
    return null;
  }
}

/**
 * Fetches all users data from the system
 * @returns Array of user data
 */
export async function fetchUserData(): Promise<UserData[]> {
  try {
    console.log('Fetching all users data - comprehensive approach');
    
    // Try to get all users via admin API first (most reliable for getting all 17 users)
    let authUsers = [];
    try {
      console.log('Attempting to fetch via admin.listUsers API...');
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100 // Ensure we get all users (more than 17)
      });
      
      if (!error && data?.users) {
        console.log(`Successfully fetched ${data.users.length} users via admin API`);
        authUsers = data.users;
      } else if (error) {
        console.warn('Error fetching via admin API:', error.message);
      }
    } catch (adminError) {
      console.warn('Could not fetch auth users directly:', adminError);
    }
    
    // If admin API didn't work, fall back to fetchAuthUsers
    if (authUsers.length === 0) {
      console.log('Falling back to fetchAuthUsers function...');
      const fallbackUsers = await fetchAuthUsers();
      if (fallbackUsers && fallbackUsers.length > 0) {
        console.log(`Got ${fallbackUsers.length} users from fallback method`);
        authUsers = fallbackUsers;
      } else {
        console.warn('No users found from any source');
        return [];
      }
    }
    
    console.log(`Processing ${authUsers.length} users to format as UserData`);
    
    // Batch fetch all company_users for better performance
    const { data: allCompanyUsers, error: companyUsersError } = await supabase
      .from('company_users')
      .select(`
        user_id,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        role,
        company_id,
        companies:company_id(id, name, contact_email, contact_phone)
      `);
      
    if (companyUsersError) {
      console.warn('Error fetching all company users:', companyUsersError.message);
    }
    
    // Create a map for quick lookup
    const companyUsersMap = new Map();
    if (allCompanyUsers) {
      allCompanyUsers.forEach(user => {
        companyUsersMap.set(user.user_id, user);
      });
      console.log(`Created lookup map with ${companyUsersMap.size} company users`);
    }
    
    // Batch fetch all profiles for better performance
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.warn('Error fetching all profiles:', profilesError.message);
    }
    
    // Create a map for quick lookup
    const profilesMap = new Map();
    if (allProfiles) {
      allProfiles.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
      console.log(`Created lookup map with ${profilesMap.size} profiles`);
    }
    
    // Transform auth users to UserData format
    const usersData: UserData[] = authUsers.map(user => {
      // Get related data from maps instead of individual queries
      const companyUser = companyUsersMap.get(user.id);
      const profile = profilesMap.get(user.id);
      
      // For debugging
      if (!companyUser && !profile) {
        console.log(`User ${user.id} has no associated company_user or profile`);
      }
      
      // Format user info with appropriate fallbacks
      return {
        user_id: user.id,
        email: user.email || companyUser?.email || '',
        full_name: user.user_metadata?.full_name || companyUser?.full_name || 
                  `${user.user_metadata?.first_name || ''}${user.user_metadata?.first_name ? ' ' : ''}${user.user_metadata?.last_name || ''}`.trim() ||
                  `${companyUser?.first_name || ''}${companyUser?.first_name ? ' ' : ''}${companyUser?.last_name || ''}`.trim() ||
                  `${profile?.first_name || ''}${profile?.first_name ? ' ' : ''}${profile?.last_name || ''}`.trim() || 
                  (user.email ? user.email.split('@')[0] : 'User'),
        first_name: user.user_metadata?.first_name || companyUser?.first_name || profile?.first_name || '',
        last_name: user.user_metadata?.last_name || companyUser?.last_name || profile?.last_name || '',
        company_id: companyUser?.company_id || '',
        company_name: companyUser?.companies?.name || '',
        role: companyUser?.role || (user.app_metadata?.role as string) || 'customer',
        avatar_url: user.user_metadata?.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '',
        created_at: user.created_at || profile?.created_at || '',
        last_sign_in_at: user.last_sign_in_at || companyUser?.last_sign_in_at || ''
      };
    });
    
    console.log(`Successfully transformed ${usersData.length} users to UserData format`);
    return usersData;
  } catch (error: any) {
    handleAuthError(error, 'fetchUserData');
    return [];
  }
}
