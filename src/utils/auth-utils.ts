
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the authenticated user from Supabase Auth
 * @returns The authenticated user or null if not authenticated
 */
export const getAuthUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting authenticated user:', error);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exception getting authenticated user:', error);
    return null;
  }
};

/**
 * Gets the company ID for the current authenticated user
 * @returns The company ID or null if not found
 */
export const getUserCompanyId = async () => {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      console.error('Cannot get company ID: User not authenticated');
      return null;
    }
    
    const { data, error } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error getting user company ID:', error);
      return null;
    }
    
    return data?.company_id || null;
  } catch (error) {
    console.error('Exception getting user company ID:', error);
    return null;
  }
};
