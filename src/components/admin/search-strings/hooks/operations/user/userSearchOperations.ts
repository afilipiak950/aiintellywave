
import { supabase } from '@/integrations/supabase/client';
import { SearchString } from '@/hooks/search-strings/search-string-types';

/**
 * Utilities for searching and filtering search strings by user
 */
export const checkSpecificUser = async (
  email: string = 's.naeb@flh-mediadigital.de',
  setSearchStrings: (strings: SearchString[]) => void,
  setUserEmails: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setCompanyNames: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  setIsRefreshing: (isRefreshing: boolean) => void,
  setError: (error: string | null) => void
) => {
  try {
    setIsRefreshing(true);
    setError(null);
    
    // First get the user ID from their email
    console.log(`Admin: Checking search strings for user with email: ${email}`);
    const { data: userData, error: userError } = await supabase
      .from('company_users')
      .select('user_id, email, company_id, role')
      .ilike('email', email) // Use case-insensitive matching
      .limit(1);
    
    if (userError) {
      console.error('Error finding user by email:', userError);
      setError(`Failed to find user with email ${email}: ${userError.message}`);
      setIsRefreshing(false);
      return;
    }
    
    if (!userData || userData.length === 0) {
      console.error(`User with email ${email} not found`);
      setError(`User with email ${email} not found in company_users table. The user might exist in auth.users but not have a company_users entry.`);
      setIsRefreshing(false);
      return;
    }

    const user = userData[0];
    
    // Type guard to ensure user exists and has expected properties
    if (!user || typeof user !== 'object') {
      console.error(`Retrieved user data is invalid for email ${email}`);
      setError(`Retrieved user data is invalid for email ${email}`);
      setIsRefreshing(false);
      return;
    }
    
    // Type guard for user.user_id to make TypeScript happy
    if (!user.user_id) {
      console.error(`User found but has no user_id for email ${email}`);
      setError(`User found but has no user_id for email ${email}`);
      setIsRefreshing(false);
      return;
    }
    
    const userId = user.user_id;
    console.log(`Found user ID ${userId} for email ${email}`);
    
    // Set up user email mapping right away to ensure we have it
    setUserEmails((prev) => {
      const newMapping = { ...prev };
      if (user && typeof user.email === 'string') {
        newMapping[userId] = user.email;
        // Also add the lowercase version for case-insensitive matching
        newMapping[userId.toLowerCase()] = user.email;
      }
      return newMapping;
    });
    
    // Now get all search strings for this user
    console.log(`Fetching search strings for user ID: ${userId}`);
    
    // Try an exact match first
    let { data: stringData, error: stringError } = await supabase
      .from('search_strings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // If no results with exact match, try case-insensitive
    if ((!stringData || stringData.length === 0) && !stringError) {
      console.log(`No exact matches found. Trying case-insensitive comparison...`);
      // Unfortunately supabase doesn't have a native case-insensitive UUID comparison
      // Let's fetch all search strings and filter client-side
      const { data: allStrings, error: allStringsError } = await supabase
        .from('search_strings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!allStringsError && allStrings) {
        stringData = allStrings.filter(s => 
          s.user_id && s.user_id.toLowerCase() === userId.toLowerCase()
        );
        console.log(`Found ${stringData.length} strings via case-insensitive comparison`);
      } else if (allStringsError) {
        stringError = allStringsError;
      }
    }
    
    if (stringError) {
      console.error('Error fetching user search strings:', stringError);
      setError(`Failed to load search strings for user: ${stringError.message}`);
      setIsRefreshing(false);
      return;
    }
    
    console.log(`Found ${stringData?.length || 0} search strings for user ID ${userId}`);
    
    // Set the search strings directly - empty array is valid!
    setSearchStrings(stringData || []);
    
    // Show appropriate message based on if we found any strings
    if (!stringData || stringData.length === 0) {
      console.log(`No search strings found for user ${email}`);
    } else {
      console.log(`Found ${stringData.length} search strings for ${email}`);
    }
    
    // Also fetch company details if needed
    if (user.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', user.company_id)
        .limit(1);
        
      if (companyData && companyData.length > 0) {
        setCompanyNames((prev) => {
          const newMapping = { ...prev };
          newMapping[companyData[0].id] = companyData[0].name;
          return newMapping;
        });
      }
    }
    
  } catch (error: any) {
    console.error('Error in checkSpecificUser:', error);
    setError(`Unexpected error checking user: ${error.message || 'Unknown error'}`);
  } finally {
    setIsRefreshing(false);
  }
};
