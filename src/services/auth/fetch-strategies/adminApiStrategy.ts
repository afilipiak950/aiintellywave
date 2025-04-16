
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

/**
 * Fetches users directly from Supabase Auth admin API
 */
export async function fetchUsersViaAdminApi(): Promise<AuthUser[] | null> {
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
    
    return null;
  } catch (error: any) {
    console.warn('Could not fetch auth users directly:', error.message);
    return null;
  }
}
