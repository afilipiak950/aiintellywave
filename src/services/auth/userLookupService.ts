
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a user exists by ID using the RPC function
 * This bypasses RLS and checks across all tables
 */
export const checkUserExists = async (userId: string): Promise<{
  exists: boolean;
  source?: string;
  user?: {
    id: string;
    email?: string;
    created_at?: string;
  };
}> => {
  try {
    // First try using the check-user-exists edge function
    const { data, error } = await supabase.functions.invoke('check-user-exists', {
      body: { userId }
    });
    
    if (error) {
      console.error('Error invoking check-user-exists function:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to check if user exists:', error);
    
    // Fallback to checking with RPC if available
    try {
      const { data, error: rpcError } = await supabase.rpc('check_user_exists', { 
        lookup_user_id: userId 
      });
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw rpcError;
      }
      
      return { exists: !!data };
    } catch (rpcFallbackError) {
      console.error('RPC fallback failed:', rpcFallbackError);
      
      // Last resort - manually check each table
      // Try company_users first as it's most likely to be accessible
      const { count: companyUserCount } = await supabase
        .from('company_users')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if ((companyUserCount ?? 0) > 0) {
        return { exists: true, source: 'company_users_manual' };
      }
      
      // Try profiles
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('id', userId);
        
      if ((profileCount ?? 0) > 0) {
        return { exists: true, source: 'profiles_manual' };
      }
      
      // Try user_roles
      const { count: roleCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
        
      if ((roleCount ?? 0) > 0) {
        return { exists: true, source: 'user_roles_manual' };
      }
      
      // No matches found
      return { exists: false };
    }
  }
};
