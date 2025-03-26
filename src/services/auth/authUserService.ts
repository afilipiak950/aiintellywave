
import { supabase } from '../../integrations/supabase/client';
import { toast } from "../../hooks/use-toast";
import { AuthUser } from '../types/customerTypes';

// Function to fetch all users from auth.users table
export async function fetchAuthUsers(): Promise<AuthUser[]> {
  try {
    console.log('Fetching auth users data...');
    
    // Approach 1: Try to get auth users directly
    try {
      const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
      
      if (!authUsersError && authUsers?.users?.length > 0) {
        console.log('Auth users fetched directly:', authUsers.users.length);
        
        // Transform the data to match our AuthUser interface
        const formattedUsers: AuthUser[] = authUsers.users.map((user: any) => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || '',
          app_metadata: user.app_metadata || {},
          user_metadata: user.user_metadata || {}
        }));
        
        return formattedUsers;
      }
    } catch (directAuthError: any) {
      console.warn('Could not fetch auth users directly:', directAuthError.message);
      // Continue to fallback method
    }
    
    // Approach 2: Fallback to company_users table
    const { data: companyUsers, error: companyError } = await supabase
      .from('company_users')
      .select('*');
      
    if (companyError) {
      throw companyError;
    }
    
    if (!companyUsers || companyUsers.length === 0) {
      // Approach 3: Try profiles as a last resort
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        console.warn('No users found in any table');
        return [];
      }
      
      console.log('Users fetched from profiles:', profiles.length);
      
      // Transform profiles to AuthUser format
      const profileUsers: AuthUser[] = profiles.map((profile: any) => ({
        id: profile.id,
        email: '', // No email in profiles
        created_at: profile.created_at || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        user_metadata: {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
        }
      }));
      
      return profileUsers;
    }
    
    console.log('Users fetched from company_users:', companyUsers.length);
    
    // Transform company_users to AuthUser format
    const companyAuthUsers: AuthUser[] = companyUsers.map((user: any) => ({
      id: user.user_id,
      email: user.email || '',
      created_at: user.created_at_auth || user.created_at || '',
      last_sign_in_at: user.last_sign_in_at || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
      avatar_url: user.avatar_url || '',
      user_metadata: {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        role: user.role || 'customer'
      }
    }));
    
    return companyAuthUsers;
  } catch (error: any) {
    console.error('Error fetching auth users:', error);
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
