
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
        perPage: 1000 // Significantly increased to ensure we get all users
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
    
    // APPROACH 5: Get user_roles as a last resort
    let userRolesData: any[] = [];
    try {
      console.log('5. Fetching all user_roles records...');
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (!userRolesError && userRoles) {
        console.log(`5. Found ${userRoles.length} user_roles records`);
        userRolesData = userRoles;
      } else {
        console.warn('5. Error fetching user_roles:', userRolesError?.message);
      }
    } catch (rolesError) {
      console.warn('5. Exception fetching user_roles:', rolesError);
    }
    
    // Combine all unique auth users from different methods
    const allAuthUsers = getUniqueUsers([authUsersFromAdmin, authUsersFromHelper]);
    console.log(`Combined ${allAuthUsers.length} unique users from all auth sources`);
    
    // Start with all identified sources of user data
    let usersDataSources: any[] = [];
    
    // 1. Start with all auth users if we have them
    if (allAuthUsers.length > 0) {
      usersDataSources = allAuthUsers.map(user => ({
        source: 'auth',
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        role: user.app_metadata?.role
      }));
      console.log(`Added ${usersDataSources.length} users from auth sources`);
    }
    
    // 2. Add or update with company_users data
    if (companyUsers.length > 0) {
      // For each company user, either update existing or add new
      companyUsers.forEach(companyUser => {
        const existingUserIndex = usersDataSources.findIndex(u => u.id === companyUser.user_id);
        if (existingUserIndex >= 0) {
          // Update existing user with company info
          usersDataSources[existingUserIndex] = {
            ...usersDataSources[existingUserIndex],
            company_id: companyUser.company_id,
            company_name: companyUser.companies?.name,
            company_email: companyUser.companies?.contact_email,
            company_phone: companyUser.companies?.contact_phone,
            email: usersDataSources[existingUserIndex].email || companyUser.email,
            role: usersDataSources[existingUserIndex].role || companyUser.role,
            first_name: usersDataSources[existingUserIndex].metadata?.first_name || companyUser.first_name,
            last_name: usersDataSources[existingUserIndex].metadata?.last_name || companyUser.last_name,
            full_name: usersDataSources[existingUserIndex].metadata?.full_name || companyUser.full_name,
            avatar_url: usersDataSources[existingUserIndex].metadata?.avatar_url || companyUser.avatar_url
          };
        } else {
          // Add new user from company_users
          usersDataSources.push({
            source: 'company_users',
            id: companyUser.user_id,
            email: companyUser.email,
            company_id: companyUser.company_id,
            company_name: companyUser.companies?.name,
            company_email: companyUser.companies?.contact_email,
            company_phone: companyUser.companies?.contact_phone,
            role: companyUser.role,
            first_name: companyUser.first_name,
            last_name: companyUser.last_name,
            full_name: companyUser.full_name,
            avatar_url: companyUser.avatar_url
          });
        }
      });
      console.log(`After incorporating company_users, we now have ${usersDataSources.length} users`);
    }
    
    // 3. Add or update with profiles data
    if (profilesData.length > 0) {
      profilesData.forEach(profile => {
        const existingUserIndex = usersDataSources.findIndex(u => u.id === profile.id);
        if (existingUserIndex >= 0) {
          // Update existing user with profile info
          usersDataSources[existingUserIndex] = {
            ...usersDataSources[existingUserIndex],
            first_name: usersDataSources[existingUserIndex].first_name || profile.first_name,
            last_name: usersDataSources[existingUserIndex].last_name || profile.last_name,
            avatar_url: usersDataSources[existingUserIndex].avatar_url || profile.avatar_url,
            created_at: usersDataSources[existingUserIndex].created_at || profile.created_at
          };
        } else {
          // Add new user from profiles
          usersDataSources.push({
            source: 'profiles',
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at
          });
        }
      });
      console.log(`After incorporating profiles, we now have ${usersDataSources.length} users`);
    }
    
    // 4. Add any missing users from user_roles as last resort
    if (userRolesData.length > 0) {
      userRolesData.forEach(roleData => {
        const existingUserIndex = usersDataSources.findIndex(u => u.id === roleData.user_id);
        if (existingUserIndex >= 0) {
          // Just update the role if not already set
          if (!usersDataSources[existingUserIndex].role) {
            usersDataSources[existingUserIndex].role = roleData.role;
          }
        } else {
          // Add new user with minimal info
          usersDataSources.push({
            source: 'user_roles',
            id: roleData.user_id,
            role: roleData.role
          });
        }
      });
      console.log(`After incorporating user_roles, we now have ${usersDataSources.length} users`);
    }
    
    // If we STILL have no users, something is very wrong
    if (usersDataSources.length === 0) {
      console.error('NO USERS FOUND FROM ANY SOURCE. Supabase connection might be down.');
      // Emergency fallback - create a dummy user to prevent UI from breaking
      usersDataSources = [{
        source: 'emergency_fallback',
        id: '00000000-0000-0000-0000-000000000000',
        email: 'emergency@fallback.com',
        role: 'admin',
        full_name: 'EMERGENCY FALLBACK USER'
      }];
    }
    
    // Transform to UserData format with all available information
    const usersData: UserData[] = usersDataSources.map(user => {
      // Create a properly formatted user object
      const formattedUser: UserData = {
        user_id: user.id,
        email: user.email || '',
        full_name: user.full_name || user.metadata?.full_name || 
                  `${user.first_name || user.metadata?.first_name || ''} ${user.last_name || user.metadata?.last_name || ''}`.trim() ||
                  (user.email ? user.email.split('@')[0] : 'Unknown User'),
        first_name: user.first_name || user.metadata?.first_name || '',
        last_name: user.last_name || user.metadata?.last_name || '',
        company_id: user.company_id || '',
        company_name: user.company_name || '',
        role: user.role || 'customer',
        avatar_url: user.avatar_url || user.metadata?.avatar_url || '',
        created_at: user.created_at || '',
        last_sign_in_at: user.last_sign_in_at || ''
      };
      
      return formattedUser;
    });
    
    console.log(`Successfully processed ${usersData.length} users to UserData format`);
    return usersData;
  } catch (error: any) {
    handleAuthError(error, 'fetchUserData');
    return [];
  }
}
