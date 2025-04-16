
import { supabase } from '../../integrations/supabase/client';
import { handleAuthError } from '../auth/utils/errorHandler';
import { UserData } from '../types/customerTypes';

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
