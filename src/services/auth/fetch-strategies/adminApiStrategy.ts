
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

export async function fetchUsersViaAdminApi(): Promise<AuthUser[]> {
  try {
    // Try to use the auth.admin.listUsers API if available
    const { data: authUsers, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000 // Get up to 1000 users
    });
    
    if (error) {
      console.error('Error in fetchUsersViaAdminApi:', error);
      return [];
    }
    
    if (!authUsers || !authUsers.users || !Array.isArray(authUsers.users)) {
      console.warn('No users returned from admin API or unexpected format');
      return [];
    }
    
    // Map the auth users to our AuthUser type
    return authUsers.users.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.role || user.user_metadata?.role,
      first_name: user.user_metadata?.first_name,
      last_name: user.user_metadata?.last_name,
      full_name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
      avatar_url: user.user_metadata?.avatar_url,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    }));
  } catch (error) {
    console.error('Exception in fetchUsersViaAdminApi:', error);
    throw error;
  }
}
