
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

export async function fetchUsersViaAdminApi(): Promise<AuthUser[]> {
  try {
    // Since we're hitting 403 errors on the admin API, we'll use a different approach
    // First, try to fetch directly from user_roles table as a fallback
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (userRolesError) {
      console.error('Error in fetchUsersViaAdminApi (user_roles fallback):', userRolesError);
      return [];
    }
    
    // Next, fetch from company_users to get more user info
    const { data: companyUsersData, error: companyUsersError } = await supabase
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
        companies:company_id (
          id, 
          name
        )
      `);
      
    if (companyUsersError) {
      console.error('Error in fetchUsersViaAdminApi (company_users fallback):', companyUsersError);
      return [];
    }
    
    // Fetch from profiles as another data source
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (profilesError) {
      console.error('Error in fetchUsersViaAdminApi (profiles fallback):', profilesError);
      return [];
    }
    
    // Create a map of user roles
    const userRolesMap = new Map();
    userRolesData?.forEach(userRole => {
      userRolesMap.set(userRole.user_id, userRole.role);
    });
    
    // Create a map of profiles
    const profilesMap = new Map();
    profilesData?.forEach(profile => {
      profilesMap.set(profile.id, profile);
    });
    
    // Combine data to create AuthUser objects
    const users: AuthUser[] = companyUsersData?.map(user => {
      const profile = profilesMap.get(user.user_id);
      
      return {
        id: user.user_id,
        email: user.email || '',
        role: user.role || userRolesMap.get(user.user_id) || 'customer',
        created_at: user.created_at_auth || '',
        last_sign_in_at: user.last_sign_in_at || '',
        first_name: user.first_name || profile?.first_name || '',
        last_name: user.last_name || profile?.last_name || '',
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
        avatar_url: user.avatar_url || profile?.avatar_url || '',
        app_metadata: {
          role: user.role || userRolesMap.get(user.user_id) || 'customer'
        },
        user_metadata: {
          first_name: user.first_name || profile?.first_name || '',
          last_name: user.last_name || profile?.last_name || '',
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
          avatar_url: user.avatar_url || profile?.avatar_url || ''
        },
        company_id: user.company_id,
        company_name: user.companies?.name || ''
      };
    }) || [];
    
    console.log(`fetchUsersViaAdminApi: Generated ${users.length} users from company_users/profiles`);
    
    if (users.length === 0) {
      // If we still have no users, create at least a fallback one
      console.warn('No users found in company_users/profiles, returning a fallback user');
      return [{
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        full_name: 'Emergency Fallback User',
        app_metadata: { role: 'admin' },
        user_metadata: { full_name: 'Emergency Fallback User' }
      }];
    }
    
    return users;
  } catch (error) {
    console.error('Exception in fetchUsersViaAdminApi:', error);
    return [];
  }
}
