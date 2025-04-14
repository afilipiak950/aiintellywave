
import { supabase } from '@/integrations/supabase/client';

/**
 * Advanced debugging utilities for user search strings
 */
export const debugUser = async (email: string) => {
  try {
    // First try to find the user with case-sensitive match
    let { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('user_id, email, company_id')
      .eq('email', email)
      .limit(1);

    if (userError) {
      return { error: `Error finding user: ${userError.message}` };
    }

    // If no exact match, try case-insensitive
    if (!userData || userData.length === 0) {
      const { data: caseInsensitiveUser, error: caseInsensitiveError } = await supabase
        .from('company_users')
        .select('user_id, email, company_id')
        .ilike('email', email)
        .limit(1);
        
      if (caseInsensitiveError) {
        return { error: `Error in case-insensitive user search: ${caseInsensitiveError.message}` };
      }
      
      if (!caseInsensitiveUser || caseInsensitiveUser.length === 0) {
        return { error: `User with email ${email} not found in company_users table (tried both case-sensitive and insensitive)` };
      }
      
      // Continue with the case-insensitive match
      userData = caseInsensitiveUser;
    }

    const userId = userData[0].user_id;
    
    // Now check search strings with exact user ID match
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
    
    // Check all strings to find case-insensitive matches
    const { data: allStrings, error: allStringsError } = await supabase
      .from('search_strings')
      .select('id, user_id, input_source, type, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    let caseInsensitiveMatches = [];
    if (!allStringsError && allStrings) {
      caseInsensitiveMatches = allStrings.filter(
        s => s.user_id && s.user_id.toLowerCase() === userId.toLowerCase() && s.user_id !== userId
      );
    }

    // Get total count of search strings
    const { count: allStringsCount, error: countError } = await supabase
      .from('search_strings')
      .select('*', { count: 'exact', head: true });
      
    // Check for auth.users record
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    return {
      user: userData[0],
      searchStrings: stringsData || [],
      caseInsensitiveMatches: caseInsensitiveMatches.length > 0 ? caseInsensitiveMatches : null,
      authUser: authData?.user || null,
      allStringsCount: allStringsCount || 0,
      allStrings: allStrings?.map(s => ({ 
        id: s.id, 
        user_id: s.user_id, 
        input_source: s.input_source,
        user_id_lowercase: s.user_id ? s.user_id.toLowerCase() : null,
        matches_user: s.user_id ? s.user_id.toLowerCase() === userId.toLowerCase() : false,
        exact_match: s.user_id === userId
      })).slice(0, 20)
    };
  } catch (err: any) {
    return { error: `Unexpected error: ${err.message}` };
  }
};
