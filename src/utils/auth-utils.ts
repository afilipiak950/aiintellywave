
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the currently authenticated user
 * @returns The current user object or null if not authenticated
 */
export const getAuthUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
  
  return data?.user || null;
};
