
import { supabase } from '../../integrations/supabase/client';
import { handleAuthError } from '../auth/utils/errorHandler';
import { UserData } from '../types/customerTypes';
import { fetchAuthUsers, getUniqueUsers } from '../auth/authUserService';

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
    console.log('Fetching all users data - COMPREHENSIVE APPROACH');
    
    // APPROACH 1: Get users via admin API
    let authUsersFromAdmin: any[] = [];
    try {
      console.log('1. Attempting to fetch via admin.listUsers API with larger perPage...');
      
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100 // Significantly increased to ensure we get all users
      });
      
      if (!error && data?.users) {
        console.log(`1. Successfully fetched ${data.users.length} users via admin API`);
        authUsersFromAdmin = data.users;
      } else if (error) {
        console.warn('1. Error fetching via admin API:', error.message);
      }
    } catch (adminError) {
      console.warn('1. Could not fetch auth users via admin API:', adminError);
    }
    
    // APPROACH 2: Get users via fetchAuthUsers helper (tries multiple methods)
    let authUsersFromHelper: any[] = [];
    try {
      console.log('2. Trying fetchAuthUsers helper function...');
      authUsersFromHelper = await fetchAuthUsers();
      console.log(`2. fetchAuthUsers returned ${authUsersFromHelper.length} users`);
    } catch (helperError) {
      console.warn('2. Error in fetchAuthUsers helper:', helperError);
    }
    
    // APPROACH 3: Get all company_users to ensure we have a complete set
    let companyUsers: any[] = [];
    try {
      console.log('3. Fetching all company_users records...');
      const { data: companyUsersData, error: companyError } = await supabase
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
        
      if (!companyError && companyUsersData) {
        console.log(`3. Found ${companyUsersData.length} company_users records`);
        companyUsers = companyUsersData;
      } else {
        console.warn('3. Error fetching company_users:', companyError?.message);
      }
    } catch (companyError) {
      console.warn('3. Exception fetching company_users:', companyError);
    }
    
    // APPROACH 4: Get profiles as another source of user data
    let profilesData: any[] = [];
    try {
      console.log('4. Fetching all profiles records...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (!profilesError && profiles) {
        console.log(`4. Found ${profiles.length} profile records`);
        profilesData = profiles;
      } else {
        console.warn('4. Error fetching profiles:', profilesError?.message);
      }
    } catch (profileError) {
      console.warn('4. Exception fetching profiles:', profileError);
    }
    
    // Combine all unique auth users from different methods
    const allAuthUsers = getUniqueUsers([authUsersFromAdmin, authUsersFromHelper]);
    console.log(`Combined ${allAuthUsers.length} unique users from all auth sources`);
    
    // If we have users from auth OR company_users, process them
    if (allAuthUsers.length > 0 || companyUsers.length > 0) {
      console.log(`Processing data sources: ${allAuthUsers.length} auth users, ${companyUsers.length} company users, ${profilesData.length} profiles`);
      
      // Create a map of company users by user_id for faster lookups
      const companyUsersMap = new Map();
      companyUsers.forEach(user => {
        if (user.user_id) {
          companyUsersMap.set(user.user_id, user);
        }
      });
      
      // Create a map of profiles by id for faster lookups
      const profilesMap = new Map();
      profilesData.forEach(profile => {
        if (profile.id) {
          profilesMap.set(profile.id, profile);
        }
      });
      
      // Start with company users if we have no auth users
      let baseUserList = allAuthUsers.length > 0 ? allAuthUsers : [];
      
      // If we have company users but no auth users, use company users as base
      if (baseUserList.length === 0 && companyUsers.length > 0) {
        baseUserList = companyUsers.map(cu => ({
          id: cu.user_id,
          email: cu.email,
          user_metadata: {
            full_name: cu.full_name,
            first_name: cu.first_name,
            last_name: cu.last_name,
            avatar_url: cu.avatar_url
          },
          app_metadata: {
            role: cu.role
          }
        }));
      }
      
      // Also ensure we have all user_ids from profiles included
      const existingUserIds = new Set(baseUserList.map(u => u.id));
      
      // Add any profiles that aren't already included
      profilesData.forEach(profile => {
        if (profile.id && !existingUserIds.has(profile.id)) {
          baseUserList.push({
            id: profile.id,
            email: null, // We don't have this from profiles
            user_metadata: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url
            }
          });
          existingUserIds.add(profile.id);
        }
      });
      
      console.log(`Final combined base list has ${baseUserList.length} users`);
      
      // Transform to UserData format with all available information
      const usersData: UserData[] = baseUserList.map(user => {
        const userId = user.id;
        const companyUser = companyUsersMap.get(userId);
        const profile = profilesMap.get(userId);
        
        // Debug for this specific user
        console.log(`Processing user ID: ${userId}, email: ${user.email || companyUser?.email || 'unknown'}`);
        
        // Format user info with appropriate fallbacks
        return {
          user_id: userId,
          email: user.email || companyUser?.email || '',
          full_name: user.user_metadata?.full_name || companyUser?.full_name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
                    `${companyUser?.first_name || ''} ${companyUser?.last_name || ''}`.trim() ||
                    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                    (user.email ? user.email.split('@')[0] : 'User'),
          first_name: user.user_metadata?.first_name || companyUser?.first_name || profile?.first_name || '',
          last_name: user.user_metadata?.last_name || companyUser?.last_name || profile?.last_name || '',
          company_id: companyUser?.company_id || '',
          company_name: companyUser?.companies?.name || '',
          role: companyUser?.role || (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'customer',
          avatar_url: user.user_metadata?.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '',
          created_at: user.created_at || profile?.created_at || '',
          last_sign_in_at: user.last_sign_in_at || companyUser?.last_sign_in_at || ''
        };
      });
      
      console.log(`Successfully processed ${usersData.length} users to UserData format`);
      return usersData;
    } else {
      console.error('No users found through any method. Returning empty array.');
      return [];
    }
  } catch (error: any) {
    handleAuthError(error, 'fetchUserData');
    return [];
  }
}
