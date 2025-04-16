
import { supabase } from '../../../integrations/supabase/client';
import { AuthUser } from '../../types/customerTypes';

/**
 * Fetches users from profiles table as last resort
 */
export async function fetchUsersViaProfiles(): Promise<AuthUser[] | null> {
  try {
    console.log('Attempting last resort: fetch from profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*');
      
    if (allProfilesError) {
      console.error('Error fetching profiles:', allProfilesError.message);
      return null;
    }
    
    if (!allProfiles || allProfiles.length === 0) {
      console.warn('No profiles found');
      return null;
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
  } catch (error: any) {
    console.warn('Error in fetchUsersViaProfiles:', error.message);
    return null;
  }
}
