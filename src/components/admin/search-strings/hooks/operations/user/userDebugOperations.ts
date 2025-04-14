
import { supabase } from '@/integrations/supabase/client';

/**
 * Advanced debugging utilities for user search strings
 */
export const debugUser = async (email: string) => {
  try {
    // First get user ID from email
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('user_id, email, company_id')
      .eq('email', email)
      .limit(1);

    if (userError) {
      return { error: `Error finding user: ${userError.message}` };
    }

    if (!userData || userData.length === 0) {
      return { error: `User with email ${email} not found in company_users table` };
    }

    const userId = userData[0].user_id;
    
    // Now check for search strings with this ID
    const { data: stringsData, error: stringsError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', userId);
      
    if (stringsError) {
      return { 
        user: userData[0],
        error: `Error finding search strings: ${stringsError.message}`
      };
    }
    
    // Try case-insensitive search as well
    const { data: caseInsensitiveStrings, error: caseInsensitiveError } = await supabase
      .from('search_strings')
      .select('*')
      .order('created_at', { ascending: false });

    let caseInsensitiveMatches = [];
    if (!caseInsensitiveError && caseInsensitiveStrings) {
      caseInsensitiveMatches = caseInsensitiveStrings.filter(
        s => s.user_id && s.user_id.toLowerCase() === userId.toLowerCase()
      );
    }

    // Also check for ALL search strings
    const { data: allStrings, error: allStringsError } = await supabase
      .from('search_strings')
      .select('*')
      .limit(100);

    // Check for auth.users record
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    return {
      user: userData[0],
      searchStrings: stringsData || [],
      caseInsensitiveMatches: caseInsensitiveMatches.length > 0 ? caseInsensitiveMatches : null,
      authUser: authUser?.user || null,
      allStringsCount: allStrings?.length || 0,
      allStrings: allStrings?.map(s => ({ 
        id: s.id, 
        user_id: s.user_id, 
        input_source: s.input_source,
        user_id_lowercase: s.user_id ? s.user_id.toLowerCase() : null,
        matches_user: s.user_id ? s.user_id.toLowerCase() === userId.toLowerCase() : false
      }))
    };
  } catch (err: any) {
    return { error: `Unexpected error: ${err.message}` };
  }
};
