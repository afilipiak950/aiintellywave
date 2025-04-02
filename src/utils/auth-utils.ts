
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the current authenticated user
 * @returns User object or null if not authenticated
 */
export const getAuthUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting auth user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    return null;
  }
};

/**
 * Checks if the current user has admin role
 * @returns Boolean indicating if user is admin
 */
export const isUserAdmin = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .single();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error in isUserAdmin:', error);
    return false;
  }
};

/**
 * Checks if the current user has manager role
 * @returns Boolean indicating if user is manager
 */
export const isUserManager = async () => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .single();
      
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data?.role === 'manager';
  } catch (error) {
    console.error('Error in isUserManager:', error);
    return false;
  }
};
