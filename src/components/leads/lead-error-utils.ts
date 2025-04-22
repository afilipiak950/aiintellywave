
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to get a more user-friendly error message
 * based on the type of error encountered
 */
export const getLeadErrorMessage = (error: Error | null): string => {
  if (!error) return "Unknown error occurred";
  
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('infinite recursion')) {
    return "Database security policy error. The system is using alternate methods to load your leads.";
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return "Network connectivity issue. Please check your internet connection.";
  }
  
  if (errorMessage.includes('permission') || errorMessage.includes('access') || errorMessage.includes('not authorized')) {
    return "Permission error. You may not have access to these leads.";
  }
  
  return error.message;
};

/**
 * Get diagnostic information about the current user's permissions
 * Useful for debugging access issues
 */
export const getDiagnosticInfo = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { error: "Not authenticated" };
    
    const userId = userData.user.id;
    const email = userData.user.email;
    
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    const { data: companyUsers } = await supabase
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', userId);
      
    return {
      userId,
      email,
      timestamp: new Date().toISOString(),
      userRoles,
      companyUsers
    };
  } catch (e) {
    return { error: "Error collecting diagnostic info", details: e };
  }
};
