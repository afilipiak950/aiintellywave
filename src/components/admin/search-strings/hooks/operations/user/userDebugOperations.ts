
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '@/hooks/search-strings/search-string-types';

/**
 * Debug operations for examining user issues with search strings
 */
export const debugUser = async (email: string = 's.naeb@flh-mediadigital.de'): Promise<any> => {
  try {
    console.log(`Admin Debug: Checking user with email: ${email}`);
    
    // Get the user from company_users
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('user_id, email, company_id, role')
      .ilike('email', email)
      .limit(1);
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      return { error: `Failed to find user: ${userError.message}` };
    }
    
    if (!userData || userData.length === 0) {
      return { error: `User with email ${email} not found in company_users table` };
    }
    
    const user = userData[0];
    
    // Type guard to ensure user exists and has expected properties
    if (!user || typeof user !== 'object') {
      return { error: `Retrieved user data is invalid for email ${email}` };
    }
    
    // Get total count of search strings
    const { count: allStringsCount, error: countError } = await supabase
      .from('search_strings')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting search strings:', countError);
    }
    
    // Try to get search strings for this user directly
    let { data: searchStrings, error: searchStringsError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', user?.user_id || '')
      .order('created_at', { ascending: false });
      
    if (searchStringsError) {
      console.error('Error fetching user search strings:', searchStringsError);
    }
    
    // If no user_id available or no results, try by email pattern matching
    if ((!searchStrings || searchStrings.length === 0) && user && typeof user.email === 'string') {
      // Get all strings for case-insensitive checks
      const { data: allStrings, error: allStringsError } = await supabase
        .from('search_strings')
        .select('*');
        
      if (!allStringsError && allStrings) {
        // Perform case-insensitive matching (since UUIDs might have case discrepancies)
        const caseInsensitiveMatches = allStrings.filter(s => 
          s.user_id && user.user_id && s.user_id.toLowerCase() === user.user_id.toLowerCase()
        );
        
        if (caseInsensitiveMatches.length > 0) {
          console.log(`Found ${caseInsensitiveMatches.length} case-insensitive matches`);
          return {
            user,
            searchStrings: caseInsensitiveMatches,
            allStrings: allStrings.slice(0, 10), // Just return a sample
            caseInsensitiveMatches,
            allStringsCount
          };
        }
        
        // Return all strings for examination
        return {
          user,
          searchStrings: [],
          allStrings: allStrings.slice(0, 10),
          allStringsCount
        };
      }
    }
    
    return {
      user,
      searchStrings: searchStrings || [],
      allStringsCount
    };
  } catch (error: any) {
    console.error('Error in debugUser:', error);
    return { error: `Unexpected error in debug: ${error.message || 'Unknown error'}` };
  }
};
