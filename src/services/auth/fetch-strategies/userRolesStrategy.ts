
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

/**
 * Fetches users by combining user_roles table with company_users and profiles
 */
export async function fetchUsersViaUserRoles(): Promise<AuthUser[] | null> {
  try {
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
    
    return null;
  } catch (error: any) {
    console.warn('Error in fetchUsersViaUserRoles:', error.message);
    return null;
  }
}
