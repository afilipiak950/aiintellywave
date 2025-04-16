
import { supabase } from '../../integrations/supabase/client';
import { handleAuthError } from '../auth/utils/errorHandler';
import { UserData } from '../types/customerTypes';
import { fetchAuthUsers } from '../auth/authUserService';

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
    console.log('Fetching all users data');
    
    // Start by fetching authenticated users
    const authUsers = await fetchAuthUsers();
    
    if (!authUsers || authUsers.length === 0) {
      console.warn('No auth users found');
      return [];
    }
    
    // Transform auth users to UserData format
    const usersData: UserData[] = await Promise.all(
      authUsers.map(async (user) => {
        // Try to get additional user info from company_users table
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
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (companyUserError) {
          console.warn(`Error fetching company user for ${user.id}:`, companyUserError.message);
        }
        
        // Try to get profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.warn(`Error fetching profile for ${user.id}:`, profileError.message);
        }
        
        // Combine data with priority
        return {
          user_id: user.id,
          email: user.email || companyUser?.email || '',
          full_name: user.full_name || companyUser?.full_name || 
                    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                    `${companyUser?.first_name || ''} ${companyUser?.last_name || ''}`.trim() ||
                    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
          first_name: user.first_name || companyUser?.first_name || profile?.first_name || '',
          last_name: user.last_name || companyUser?.last_name || profile?.last_name || '',
          company_id: companyUser?.company_id || '',
          company_name: companyUser?.companies?.name || '',
          role: companyUser?.role || user.role || 'customer',
          avatar_url: user.avatar_url || companyUser?.avatar_url || profile?.avatar_url || '',
          created_at: user.created_at || profile?.created_at || '',
          last_sign_in_at: user.last_sign_in_at || ''
        };
      })
    );
    
    console.log(`Successfully fetched data for ${usersData.length} users`);
    return usersData;
  } catch (error: any) {
    handleAuthError(error, 'fetchUserData');
    return [];
  }
}
