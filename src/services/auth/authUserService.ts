
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { AuthUser } from '../types/customerTypes';

// Function to fetch all users from auth.users table
export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('Fetching auth users data...');
    
    // Try DIRECT approach using admin listUsers function (should get all 17 users)
    try {
      console.log('Attempting to fetch users via admin.listUsers API...');
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 100 // Set higher to ensure all users are retrieved
      });
      
      if (!authUsersError && authUsers?.users?.length > 0) {
        console.log('Successfully fetched users via admin API:', authUsers.users.length);
        
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
    }
    
    // FALLBACK 1: Try to get users from user_roles and join with company_users for complete data
    console.log('Attempting alternate method: fetch from user_roles...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
      
    if (!userRolesError && userRoles && userRoles.length > 0) {
      console.log('Found users in user_roles:', userRoles.length);
      
      // Get all user IDs from user_roles
      const userIds = userRoles.map(role => role.user_id);
      
      // Fetch additional user details from company_users
      const { data: companyUsers, error: companyUsersError } = await supabase
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
          last_sign_in_at,
          created_at_auth,
          companies:company_id(name)
        `)
        .in('user_id', userIds);
      
      // Create a map for easy lookup
      const companyUsersMap = new Map();
      if (!companyUsersError && companyUsers) {
        companyUsers.forEach(user => {
          companyUsersMap.set(user.user_id, user);
        });
      }
      
      // Fetch additional data from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      // Create a map for profiles
      const profilesMap = new Map();
      if (!profilesError && profiles) {
        profiles.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }
      
      // Combine data from user_roles, company_users, and profiles
      const formattedUsers: AuthUser[] = userIds.map(userId => {
        const roleInfo = userRoles.find(r => r.user_id === userId);
        const companyUser = companyUsersMap.get(userId);
        const profile = profilesMap.get(userId);
        
        return {
          id: userId,
          email: companyUser?.email || '',
          created_at: companyUser?.created_at_auth || profile?.created_at || '',
          last_sign_in_at: companyUser?.last_sign_in_at || '',
          role: roleInfo?.role || companyUser?.role || 'customer',
          first_name: companyUser?.first_name || profile?.first_name || '',
          last_name: companyUser?.last_name || profile?.last_name || '',
          full_name: companyUser?.full_name || 
                    `${companyUser?.first_name || ''} ${companyUser?.last_name || ''}`.trim() || 
                    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 
                    'User',
          avatar_url: companyUser?.avatar_url || profile?.avatar_url || '',
          user_metadata: {
            first_name: companyUser?.first_name || profile?.first_name || '',
            last_name: companyUser?.last_name || profile?.last_name || '',
            name: companyUser?.full_name || 
                  `${companyUser?.first_name || ''} ${companyUser?.last_name || ''}`.trim() || 
                  `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User'
          },
          company_id: companyUser?.company_id || '',
          company_name: companyUser?.companies?.name || ''
        };
      });
      
      console.log(`Formatted ${formattedUsers.length} users via user_roles approach`);
      return formattedUsers;
    } else if (userRolesError) {
      console.warn('Error fetching from user_roles:', userRolesError.message);
    }
    
    // FALLBACK 2: Try direct company_users approach if both previous methods failed
    console.log('Attempting to fetch directly from company_users...');
    const { data: allCompanyUsers, error: allCompanyUsersError } = await supabase
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
        last_sign_in_at,
        created_at_auth,
        companies:company_id(name)
      `);
      
    if (allCompanyUsersError) {
      console.error('Error fetching from company_users:', allCompanyUsersError.message);
      
      // FALLBACK 3: Last resort - try profiles table
      console.log('Attempting last resort: fetch from profiles...');
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (allProfilesError) {
        console.error('Error fetching profiles:', allProfilesError.message);
        throw new Error('Failed to fetch user data from any source');
      }
      
      if (!allProfiles || allProfiles.length === 0) {
        console.warn('No profiles found');
        return [];
      }
      
      console.log('Successfully fetched profiles:', allProfiles.length);
      
      // Format profiles as AuthUsers
      const formattedUsers: AuthUser[] = allProfiles.map(profile => ({
        id: profile.id,
        email: '',
        created_at: profile.created_at || '',
        role: 'customer',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
        avatar_url: profile.avatar_url || '',
        user_metadata: {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
        }
      }));
      
      console.log(`Formatted ${formattedUsers.length} users from profiles table`);
      return formattedUsers;
    }
    
    if (!allCompanyUsers || allCompanyUsers.length === 0) {
      console.warn('No company users found');
      return [];
    }
    
    console.log('Successfully fetched company_users:', allCompanyUsers.length);
    
    // Group by user_id to deduplicate
    const userMap = new Map();
    allCompanyUsers.forEach(user => {
      if (!userMap.has(user.user_id)) {
        userMap.set(user.user_id, user);
      }
    });
    
    // Format all company users into AuthUsers
    const formattedUsers: AuthUser[] = Array.from(userMap.values()).map(user => ({
      id: user.user_id,
      email: user.email || '',
      created_at: user.created_at_auth || '',
      last_sign_in_at: user.last_sign_in_at || '',
      role: user.role || 'customer',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      avatar_url: user.avatar_url || '',
      user_metadata: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
      },
      company_id: user.company_id || '',
      company_name: user.companies?.name || ''
    }));
    
    console.log(`Formatted ${formattedUsers.length} users from company_users table`);
    return formattedUsers;
    
  } catch (error: any) {
    console.error('Error in fetchAuthUsers:', error);
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
