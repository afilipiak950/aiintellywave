
import { supabase } from '@/integrations/supabase/client';

/**
 * Debug function to analyze user and search string records
 */
export const debugUser = async (email: string) => {
  try {
    console.log(`Debugging user with email: ${email}`);
    
    // Find the user in company_users
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('*')
      .ilike('email', email)
      .limit(1);
    
    if (userError) {
      console.error('Error finding user:', userError);
      return { error: `Error finding user: ${userError.message}` };
    }
    
    // Check if user was found
    if (!userData || userData.length === 0) {
      console.error(`No user found with email ${email}`);
      return { error: `No user found with email ${email}` };
    }
    
    // User found, now check auth.users
    let authUser = null;
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authData) {
        // Find user with matching email (case insensitive)
        authUser = authData.users.find(u => {
          if (u && typeof u.email === 'string' && typeof email === 'string') {
            return u.email.toLowerCase() === email.toLowerCase();
          }
          return false;
        });
      }
    } catch (err: any) {
      console.warn('Could not check auth.users (might need admin permissions):', err);
    }
    
    // Get all search strings to analyze
    const { data: allStrings, error: stringsError } = await supabase
      .from('search_strings')
      .select('*');
    
    if (stringsError) {
      console.error('Error fetching search strings:', stringsError);
      return { 
        user: userData[0],
        authUser,
        error: `Error fetching search strings: ${stringsError.message}` 
      };
    }
    
    // Filter strings matching this user ID (both exact and case-insensitive)
    const user = userData[0];
    const userId = user?.user_id;
    
    // Exact matches
    const userSearchStrings = userId ? allStrings.filter(s => s.user_id === userId) : [];
    
    // Case-insensitive matches (might indicate an issue)
    const caseInsensitiveMatches = userId ? 
      allStrings.filter(s => 
        s.user_id && 
        typeof s.user_id === 'string' &&
        typeof userId === 'string' &&
        s.user_id.toLowerCase() === userId.toLowerCase() && 
        s.user_id !== userId
      ) : [];
    
    // Return all debug data
    return {
      user: userData[0],
      authUser,
      searchStrings: userSearchStrings,
      caseInsensitiveMatches: caseInsensitiveMatches.length > 0 ? caseInsensitiveMatches : null,
      allStringsCount: allStrings.length,
      // Include a sample of all strings for deeper debugging if needed
      allStrings: allStrings.slice(0, 5).map(s => ({
        id: s.id.substring(0, 8),
        user_id: s.user_id,
        lowercase_comparison: userId ? (s.user_id && 
          typeof s.user_id === 'string' && 
          typeof userId === 'string' && 
          s.user_id.toLowerCase() === userId.toLowerCase()) : false
      }))
    };
    
  } catch (error: any) {
    console.error('Error in debugUser:', error);
    return { 
      error: `Unexpected error debugging user: ${error.message || 'Unknown error'}`
    };
  }
};
