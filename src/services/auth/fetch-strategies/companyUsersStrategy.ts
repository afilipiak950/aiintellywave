
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

/**
 * Fetches users from company_users table directly
 */
export async function fetchUsersViaCompanyUsers(): Promise<AuthUser[] | null> {
  try {
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
      return null;
    }
    
    if (!allCompanyUsers || allCompanyUsers.length === 0) {
      console.warn('No company users found');
      return null;
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
    console.warn('Error in fetchUsersViaCompanyUsers:', error.message);
    return null;
  }
}
