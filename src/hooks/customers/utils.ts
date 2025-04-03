
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if user is an admin
 */
export async function checkIsAdminUser(userId: string, userEmail?: string): Promise<boolean> {
  try {
    // First check user_roles table
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!userRolesError && userRoles && userRoles.length > 0) {
      return userRoles.some(ur => ur.role === 'admin');
    }

    // Then check company_users table
    const { data: companyUsers, error: companyUsersError } = await supabase
      .from('company_users')
      .select('role, is_admin')
      .eq('user_id', userId);

    if (!companyUsersError && companyUsers && companyUsers.length > 0) {
      return companyUsers.some(cu => cu.role === 'admin' || cu.is_admin === true);
    }

    // Special case for admin@intellywave.de
    if (userEmail === 'admin@intellywave.de') {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
